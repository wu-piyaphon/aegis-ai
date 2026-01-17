# TypeScript Guidelines

## Core Principles

- Use strict TypeScript configuration (already enabled in tsconfig.json)
- Never use `any` type - prefer `unknown` or proper typing
- Define explicit type definitions for all props, API responses, and data structures
- Use TypeScript's utility types (Pick, Omit, Partial, Record, etc.) when appropriate
- Leverage type inference where it improves readability

## Type Definitions

### ✅ Good Examples

```typescript
// Explicit type definition with proper types
type UserProfile = {
  id: string;
  email: string;
  role: "admin" | "user" | "viewer";
  createdAt: Date;
  metadata?: Record<string, unknown>;
};

// Proper function typing
async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json();
}

// Using utility types
type UserUpdate = Partial<Pick<UserProfile, "email" | "role">>;

// Discriminated unions for better type safety
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### ❌ Bad Examples

```typescript
// Using any
async function get(id: any): Promise<any> {
  // Bad: No type safety
}

// Implicit any
function processData(data) {
  // Bad: Parameter has implicit any
}

// Unsafe type assertion
const user = data as UserProfile; // Without validation
```

## Handling Unknown Types

When dealing with external data (API responses, user input):

```typescript
// ✅ Good: Validate and narrow unknown types
function isUserProfile(data: unknown): data is UserProfile {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "email" in data &&
    "role" in data
  );
}

async function fetchUser(id: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();

  if (!isUserProfile(data)) {
    throw new Error("Invalid user data");
  }

  return data;
}
```

## Type Organization

- Place shared types in `types/` directory
- Co-locate component-specific types with the component
- Export types that are used across multiple files
- Use consistent naming: `UserProfile` not `IUserProfile` or `TUserProfile`

## Import/Export Types

```typescript
// Use type imports for better tree-shaking
import type { UserProfile } from "@/types/user";
import type { NextPage } from "next";

// Export types explicitly
export type { UserProfile };
```

## Generic Types

```typescript
// ✅ Good: Reusable generic types
type ApiResult<T> = {
  data: T;
  error?: string;
  meta: {
    timestamp: number;
    requestId: string;
  };
};

// Usage
const userResult: ApiResult<UserProfile> = await fetchUser(id);
```

## Avoid Type Assertions

Prefer type guards and validation over assertions:

```typescript
// ❌ Bad
const user = data as UserProfile;

// ✅ Good
if (isUserProfile(data)) {
  const user = data; // Type is narrowed safely
}
```

## Path Alias

Always use the `@/` alias for absolute imports (configured in tsconfig.json):

```typescript
// ✅ Good
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

// ❌ Bad
import { Button } from "../../../components/ui/button";
```
