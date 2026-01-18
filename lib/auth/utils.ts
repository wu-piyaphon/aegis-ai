import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Helper function to require authentication
 * Use this in any server component that needs authentication
 *
 * @throws Redirects to login if not authenticated
 * @returns Session object with user data
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Helper function to require a specific role
 * Use this to protect admin-only pages
 *
 * @param allowedRoles - Array of roles that can access
 * @throws Redirects to unauthorized page if role doesn't match
 * @returns Session object with user data
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Helper function to check if user has email verified
 *
 * @returns Session object if authenticated
 */
export async function requireEmailVerified() {
  const session = await requireAuth();

  if (!session.user.emailVerified) {
    redirect("/verify-email");
  }

  return session;
}

/**
 * Check if user is authenticated (doesn't redirect)
 * Use this when you want to conditionally show content
 *
 * @returns Session object or null
 */
export async function getOptionalAuth() {
  return await auth();
}
