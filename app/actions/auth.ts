"use server";

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";

/**
 * Server Action: Sign Up New User
 *
 * This creates a new user account with email/password
 *
 * @param data - Signup form data (name, email, password)
 * @returns Success/error result
 */
export async function signUpAction(data: SignupInput) {
  try {
    // Validate input data using Zod schema
    const validatedData = signupSchema.parse(data);

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Hash password using bcrypt
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user in database
    await db.insert(users).values({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: "user", // Default role
    });

    // TODO: Send verification email here
    // await sendVerificationEmail(newUser.email, verificationToken);

    return {
      success: true,
      message:
        "Account created successfully! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Signup error:", error);

    // Handle validation errors
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action: Sign In with Credentials
 *
 * This wraps the Auth.js signIn function with error handling
 *
 * @param email - User email
 * @param password - User password
 * @returns Success/error result
 */
export async function signInWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return { success: true };
  } catch (error) {
    // Auth.js throws NEXT_REDIRECT error on successful login
    // We need to re-throw it to allow the redirect
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Invalid email or password",
          };
        default:
          return {
            success: false,
            error: "Something went wrong. Please try again.",
          };
      }
    }

    throw error;
  }
}

/**
 * Server Action: Sign In with Google
 *
 * Initiates Google OAuth flow
 */
export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}
