import { DefaultSession } from "next-auth";

/**
 * Extend Next Auth types to include custom fields
 * This provides TypeScript autocomplete for session.user.role, etc.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "user" | "viewer";
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "user" | "viewer";
    emailVerified: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "user" | "viewer";
    emailVerified: Date | null;
  }
}
