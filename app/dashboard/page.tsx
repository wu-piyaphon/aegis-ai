import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

/**
 * Protected Dashboard Page
 *
 * This demonstrates how to protect a page using Auth.js v5
 * The `auth()` function gets the current session on the server
 * If no session exists, we redirect to login
 *
 * Key concepts:
 * - Server Components can directly call `auth()`
 * - No need for `getServerSession` like in Auth.js v4
 * - Session data is fully typed thanks to our type extensions
 */
export default async function DashboardPage() {
  // Get current session - this runs on the server
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Welcome back, {session.user.name || "User"}!
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            You&apos;re successfully authenticated with Aegis AI.
          </p>

          {/* User Info */}
          <div className="mt-6 space-y-3">
            <div>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Email:
              </span>
              <p className="text-zinc-900 dark:text-zinc-50">
                {session.user.email}
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Role:
              </span>
              <p className="text-zinc-900 dark:text-zinc-50">
                {session.user.role}
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Email Verified:
              </span>
              <p className="text-zinc-900 dark:text-zinc-50">
                {session.user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    Not verified
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Email Verification Notice */}
        {!session.user.emailVerified && (
          <div className="mt-4 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-amber-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">
                  Email Verification Required
                </h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
                  Please verify your email address to access all features. Check
                  your inbox for a verification link.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              AI Providers
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Connect to ChatGPT, Gemini, and other AI services
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Access Control
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Manage user permissions and roles
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Usage Analytics
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Track AI usage and costs across your organization
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
