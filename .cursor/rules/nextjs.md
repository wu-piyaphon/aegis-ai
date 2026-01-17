# Next.js App Router Guidelines

## Server Components by Default

**ALWAYS prefer Server Components unless client-side interactivity is required.**

### When to Use Server Components (Default)

- Data fetching
- Accessing backend resources directly
- Keeping sensitive information on the server (API keys, tokens)
- Rendering static content
- SEO-critical content

### When to Use Client Components

Only use `"use client"` when you need:

- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, useContext, etc.)
- Browser-only APIs (localStorage, window, etc.)
- Third-party libraries that rely on client-side features

## Component Patterns

### Server Component (Default)

```typescript
// app/users/[id]/page.tsx
type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// This is a Server Component by default
export default async function UserPage({ params, searchParams }: PageProps) {
  // Fetch data directly in the component
  const user = await fetch(`${process.env.API_URL}/users/${params.id}`, {
    cache: "no-store", // or "force-cache", "revalidate"
  }).then((res) => res.json());

  return (
    <div>
      <h1>{user.name}</h1>
      <UserProfile data={user} />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await fetchUser(params.id);
  return {
    title: `${user.name} - Aegis AI`,
    description: `Profile for ${user.name}`,
  };
}
```

### Client Component

```typescript
// components/ui/button.tsx
"use client";

import { useState } from "react";

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export function Button({
  onClick,
  children,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onClick();
    setIsLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={disabled || isLoading}>
      {isLoading ? "Loading..." : children}
    </button>
  );
}
```

## Server Actions

Use Server Actions for mutations and form handling:

```typescript
// app/actions/user.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateUserProfile(
  userId: string,
  formData: FormData
) {
  // Validate authentication
  const session = await getSession();
  if (!session || session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Extract and validate data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  // Update database
  await db.user.update({
    where: { id: userId },
    data: { name, email },
  });

  // Revalidate the page
  revalidatePath(`/users/${userId}`);
}

// Usage in a Server Component
export default function EditProfilePage({ params }: PageProps) {
  return (
    <form action={updateUserProfile.bind(null, params.id)}>
      <input name="name" />
      <input name="email" />
      <button type="submit">Save</button>
    </form>
  );
}
```

## Data Fetching

### Caching Strategies

```typescript
// No caching - always fresh
fetch(url, { cache: "no-store" });

// Cache forever (static)
fetch(url, { cache: "force-cache" });

// Revalidate after N seconds
fetch(url, { next: { revalidate: 3600 } }); // 1 hour

// Tag-based revalidation
fetch(url, { next: { tags: ["users"] } });
```

### Loading States

```typescript
// app/users/loading.tsx
export default function Loading() {
  return <div>Loading users...</div>;
}
```

### Error Boundaries

```typescript
// app/users/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## Layouts and Templates

```typescript
// app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx - Nested layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />
      <div>{children}</div>
    </div>
  );
}
```

## Route Handlers (API Routes)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  // Fetch data
  const users = await db.user.findMany({
    where: { name: { contains: query } },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate and create
  const user = await db.user.create({ data: body });

  return NextResponse.json({ user }, { status: 201 });
}
```

## Streaming with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* This loads immediately */}
      <UserInfo />

      {/* This streams in when ready */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />
      </Suspense>

      <Suspense fallback={<div>Loading chart...</div>}>
        <Chart />
      </Suspense>
    </div>
  );
}
```

## Dynamic Routes

```typescript
// app/users/[id]/page.tsx
export default async function UserPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser(params.id);
  return <div>{user.name}</div>;
}

// Static generation for known paths
export async function generateStaticParams() {
  const users = await getAllUsers();
  return users.map((user) => ({ id: user.id }));
}
```

## Proxy (Next.js 16+)

**Note:** In Next.js 16, `middleware.ts` has been renamed to `proxy.ts` and runs in Node.js runtime only.

```typescript
// proxy.ts (root level)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get("auth-token");

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Optional: Configure which routes to run proxy on
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```
