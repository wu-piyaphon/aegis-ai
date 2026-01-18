import Link from "next/link";
import { auth } from "@/auth";

/**
 * Home Page
 *
 * Landing page with authentication status
 * Shows different content for authenticated vs unauthenticated users
 */
export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center px-4 py-32">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Aegis AI
          </h1>
          <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
            Secure Enterprise Gateway for AI Platforms
          </p>
        </div>

        {/* Description */}
        <div className="mt-8 max-w-2xl text-center">
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Access ChatGPT, Gemini, and other AI agents with enterprise-grade
            authentication, authorization, and management designed for SMEs.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Go to Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  const { signOut } = await import("@/auth");
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-8 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-8 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-24 grid w-full gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="h-6 w-6 text-zinc-900 dark:text-zinc-50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Secure Authentication
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enterprise-grade auth with email/password and OAuth providers
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="h-6 w-6 text-zinc-900 dark:text-zinc-50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Role-Based Access
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Fine-grained permissions and user role management
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="h-6 w-6 text-zinc-900 dark:text-zinc-50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Multi-Provider
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Connect to ChatGPT, Gemini, and more AI platforms
            </p>
          </div>
        </div>

        {/* User Status */}
        {session && (
          <div className="mt-12 rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Signed in as{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {session.user.email}
              </span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
