# Security Guidelines

**Security is the #1 priority for Aegis AI**. Every feature must consider authentication and authorization implications.

## Core Security Principles

1. **Never trust client-side data** - Always validate on the server
2. **Never expose secrets** - Use environment variables, never hardcode
3. **Always verify permissions** - Check authorization on every request
4. **Fail securely** - Default to denying access, not allowing
5. **Log security events** - Track authentication and authorization failures

## Authentication

### Session Management

```typescript
// lib/auth/session.ts
import { cookies } from "next/headers";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) {
    return null;
  }

  try {
    const session = await verifyToken(token.value);
    return session;
  } catch (error) {
    // Invalid token
    return null;
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}
```

### Protected Server Components

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Require authentication
  const session = await requireAuth();

  // Now we know the user is authenticated
  const data = await getUserData(session.userId);

  return <Dashboard data={data} />;
}
```

### Protected API Routes

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Check authorization
  if (!canAccessUser(session, params.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with request
  const user = await getUser(params.id);
  return NextResponse.json({ user });
}
```

## Authorization

### Role-Based Access Control (RBAC)

```typescript
// types/auth.ts
export type Role = "admin" | "user" | "viewer";

export type Session = {
  userId: string;
  email: string;
  role: Role;
  permissions: string[];
};

// lib/auth/permissions.ts
export function hasPermission(session: Session, permission: string): boolean {
  return session.permissions.includes(permission);
}

export function requirePermission(session: Session, permission: string): void {
  if (!hasPermission(session, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

export function isAdmin(session: Session): boolean {
  return session.role === "admin";
}
```

### Permission Checks in Server Actions

```typescript
// app/actions/user.ts
"use server";

export async function deleteUser(userId: string) {
  const session = await requireAuth();

  // Check if user is admin
  if (!isAdmin(session)) {
    throw new Error("Admin permission required");
  }

  // Additional check: can't delete yourself
  if (session.userId === userId) {
    throw new Error("Cannot delete your own account");
  }

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
```

## Environment Variables

### .env.local Structure

```bash
# Never commit this file!
# Add .env.local to .gitignore

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# AI Providers - NEVER expose these to client
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...

# Database
DATABASE_URL=postgresql://...

# Authentication
AUTH_SECRET=your-secret-key-here
JWT_SECRET=another-secret

# Session
SESSION_COOKIE_NAME=aegis-session
SESSION_MAX_AGE=2592000  # 30 days
```

### Using Environment Variables

```typescript
// ✅ Good: Server-side only
export async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  // Use apiKey safely on server
}

// ✅ Good: Public variables (prefixed with NEXT_PUBLIC_)
export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// ❌ Bad: Exposing secrets to client
("use client");
export function BadComponent() {
  const apiKey = process.env.OPENAI_API_KEY; // This will be undefined!
  // Even if it wasn't, this would expose the key in client bundle
}
```

## Input Validation

### Server-Side Validation

```typescript
// lib/validation/user.ts
import { z } from "zod"; // Consider adding zod for validation

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user", "viewer"]).optional(),
});

// app/actions/user.ts
("use server");

export async function updateUser(userId: string, data: unknown) {
  const session = await requireAuth();

  // Validate input
  const validatedData = userUpdateSchema.parse(data);

  // Check authorization
  if (!canUpdateUser(session, userId)) {
    throw new Error("Forbidden");
  }

  // Perform update
  await db.user.update({
    where: { id: userId },
    data: validatedData,
  });
}
```

## AI Provider Security

### API Key Management

```typescript
// lib/ai/providers.ts
type AIProvider = {
  name: string;
  call: (prompt: string) => Promise<string>;
};

// ✅ Good: Keep API keys server-side
export async function getAIProvider(provider: string): Promise<AIProvider> {
  switch (provider) {
    case "openai":
      return {
        name: "OpenAI",
        call: async (prompt) => {
          const apiKey = process.env.OPENAI_API_KEY;
          // Use apiKey on server
          return callOpenAI(apiKey, prompt);
        },
      };
    // ... other providers
    default:
      throw new Error("Unknown provider");
  }
}
```

### Rate Limiting

```typescript
// lib/ai/rate-limit.ts
export async function checkRateLimit(
  userId: string,
  action: string
): Promise<boolean> {
  const key = `rate-limit:${userId}:${action}`;
  const limit = await redis.get(key);

  if (limit && parseInt(limit) >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour
  return true;
}

// Usage in Server Action
export async function callAI(prompt: string) {
  const session = await requireAuth();

  // Check rate limit
  if (!(await checkRateLimit(session.userId, "ai-call"))) {
    throw new Error("Rate limit exceeded");
  }

  // Proceed with AI call
}
```

## Error Handling

### Never Leak Sensitive Information

```typescript
// ✅ Good: Generic error messages to client
export async function handleError(error: unknown): Promise<Response> {
  // Log full error server-side
  console.error("Server error:", error);

  // Return generic message to client
  return NextResponse.json(
    { error: "An error occurred. Please try again later." },
    { status: 500 }
  );
}

// ❌ Bad: Exposing internal details
export async function badHandleError(error: unknown): Promise<Response> {
  return NextResponse.json(
    { error: error.message }, // Might expose sensitive info
    { status: 500 }
  );
}
```

## Security Checklist

Before implementing any feature, verify:

- [ ] Authentication is checked on the server
- [ ] Authorization is verified for the specific action
- [ ] User input is validated
- [ ] API keys and secrets are not exposed to client
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting is implemented for expensive operations
- [ ] Audit logs are created for sensitive actions
- [ ] HTTPS is used in production
- [ ] CSRF protection is enabled (Next.js does this by default)
- [ ] SQL injection is prevented (use parameterized queries)

## Common Vulnerabilities to Avoid

1. **Broken Authentication** - Always verify sessions server-side
2. **Broken Authorization** - Check permissions for every action
3. **Injection Attacks** - Validate and sanitize all inputs
4. **Sensitive Data Exposure** - Never send secrets to client
5. **Security Misconfiguration** - Use secure defaults
6. **XSS (Cross-Site Scripting)** - React escapes by default, but be careful with dangerouslySetInnerHTML
7. **Insecure Deserialization** - Validate data before processing
8. **Using Components with Known Vulnerabilities** - Keep dependencies updated

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
