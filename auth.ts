import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, verificationTokens } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validations/auth";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import { Adapter } from "next-auth/adapters";

/**
 * Auth.js v5 Configuration
 *
 * This is the root auth configuration that exports:
 * - handlers: GET/POST handlers for the auth API routes
 * - signIn/signOut: Server-side functions to trigger auth actions
 * - auth: Function to get the current session in server components
 *
 * Key features:
 * 1. Google OAuth for social login
 * 2. Credentials provider for email/password authentication
 * 3. JWT session strategy (better for serverless/edge)
 * 4. Custom callbacks to add user info to session
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  // Type assertion because of extended types in next-auth.d.ts for user role
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }) as Adapter,

  // Use JWT sessions (recommended for serverless environments like Vercel)
  // Database sessions would require more database queries per request
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages instead of Auth.js defaults
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input using Zod schema
          const { email, password } = loginSchema.parse(credentials);

          // Find user by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          // User not found or no password set (OAuth-only account)
          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isValidPassword = await verifyPassword(password, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Return user object (without password!)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          // Validation or database error
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    /**
     * JWT Callback
     * Runs whenever a JWT is created or updated
     * Add custom fields to the token here
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - user object is available
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }

      // Handle session updates (e.g., after email verification)
      if (trigger === "update" && session) {
        token.emailVerified = session.emailVerified;
      }

      return token;
    },

    /**
     * Session Callback
     * Runs whenever session is checked (e.g., getSession(), useSession())
     * Add custom fields from token to session here
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role =
          (token.role as "admin" | "user" | "viewer") || "user";
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },

    /**
     * Sign In Callback
     * Control whether a user is allowed to sign in
     * Return false to deny access
     */
    async signIn({ account }) {
      // For OAuth providers, always allow (email is verified by provider)
      if (account?.provider !== "credentials") {
        return true;
      }

      // For credentials, you could add additional checks here
      // For example, require email verification before allowing login
      // if (!user.emailVerified) {
      //   return false;
      // }

      return true;
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
});
