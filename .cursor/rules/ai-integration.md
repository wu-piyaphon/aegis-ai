# AI Integration Guidelines

## Overview

Aegis AI integrates with multiple AI providers (OpenAI, Google Gemini, etc.). This document outlines best practices for implementing these integrations.

## Provider Abstraction

Create a common type for all AI providers to allow easy switching and multi-provider support:

```typescript
// types/ai.ts
export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: number;
};

export type AIResponse = {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: "stop" | "length" | "content_filter";
};

export type AIProvider = {
  name: string;
  call(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>;
  stream(messages: AIMessage[], options?: AIOptions): AsyncGenerator<string>;
};

export type AIOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
};
```

## Provider Implementation

```typescript
// lib/ai/providers/openai.ts
import OpenAI from "openai";
import type { AIProvider, AIMessage, AIResponse, AIOptions } from "@/types/ai";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }
    this.client = new OpenAI({ apiKey });
  }

  async call(
    messages: AIMessage[],
    options: AIOptions = {}
  ): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model || "gpt-4",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
    });

    const choice = response.choices[0];
    return {
      content: choice.message.content || "",
      model: response.model,
      provider: this.name,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason as AIResponse["finishReason"],
    };
  }

  async *stream(
    messages: AIMessage[],
    options: AIOptions = {}
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: options.model || "gpt-4",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
```

```typescript
// lib/ai/providers/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, AIMessage, AIResponse, AIOptions } from "@/types/ai";

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async call(
    messages: AIMessage[],
    options: AIOptions = {}
  ): Promise<AIResponse> {
    const model = this.client.getGenerativeModel({
      model: options.model || "gemini-pro",
    });

    // Convert messages to Gemini format
    const prompt = this.formatMessages(messages);

    const result = await model.generateContent(prompt);
    const response = result.response;

    return {
      content: response.text(),
      model: options.model || "gemini-pro",
      provider: this.name,
      usage: {
        promptTokens: 0, // Gemini doesn't provide token counts directly
        completionTokens: 0,
        totalTokens: 0,
      },
      finishReason: "stop",
    };
  }

  async *stream(
    messages: AIMessage[],
    options: AIOptions = {}
  ): AsyncGenerator<string> {
    const model = this.client.getGenerativeModel({
      model: options.model || "gemini-pro",
    });

    const prompt = this.formatMessages(messages);
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  private formatMessages(messages: AIMessage[]): string {
    return messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
  }
}
```

## Provider Registry

```typescript
// lib/ai/registry.ts
import type { AIProvider } from "@/types/ai";
import { OpenAIProvider } from "./providers/openai";
import { GeminiProvider } from "./providers/gemini";

const providers = new Map<string, AIProvider>();

export function registerProvider(provider: AIProvider): void {
  providers.set(provider.name, provider);
}

export function getProvider(name: string): AIProvider {
  const provider = providers.get(name);
  if (!provider) {
    throw new Error(`AI provider not found: ${name}`);
  }
  return provider;
}

export function listProviders(): string[] {
  return Array.from(providers.keys());
}

// Initialize default providers
registerProvider(new OpenAIProvider());
registerProvider(new GeminiProvider());
```

## Rate Limiting

```typescript
// lib/ai/rate-limiter.ts
import { redis } from "@/lib/redis";

type RateLimit = {
  maxRequests: number;
  windowMs: number;
};

const RATE_LIMITS: Record<string, RateLimit> = {
  default: { maxRequests: 100, windowMs: 3600000 }, // 100 per hour
  premium: { maxRequests: 1000, windowMs: 3600000 }, // 1000 per hour
};

export async function checkRateLimit(
  userId: string,
  tier: string = "default"
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const limit = RATE_LIMITS[tier] || RATE_LIMITS.default;
  const key = `rate-limit:ai:${userId}`;
  const now = Date.now();

  // Get current count
  const count = await redis.get(key);
  const current = count ? parseInt(count) : 0;

  if (current >= limit.maxRequests) {
    const ttl = await redis.ttl(key);
    return {
      allowed: false,
      remaining: 0,
      resetAt: now + ttl * 1000,
    };
  }

  // Increment counter
  if (current === 0) {
    await redis.setex(key, Math.floor(limit.windowMs / 1000), "1");
  } else {
    await redis.incr(key);
  }

  return {
    allowed: true,
    remaining: limit.maxRequests - current - 1,
    resetAt: now + limit.windowMs,
  };
}
```

## Cost Tracking

```typescript
// lib/ai/cost-tracker.ts
import { db } from "@/lib/db";

type UsageLog = {
  userId: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: Date;
};

const PRICING: Record<string, { prompt: number; completion: number }> = {
  "gpt-4": { prompt: 0.03, completion: 0.06 }, // per 1K tokens
  "gpt-3.5-turbo": { prompt: 0.001, completion: 0.002 },
  "gemini-pro": { prompt: 0.00025, completion: 0.0005 },
};

export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = PRICING[model] || { prompt: 0, completion: 0 };
  return (
    (promptTokens / 1000) * pricing.prompt +
    (completionTokens / 1000) * pricing.completion
  );
}

export async function logUsage(
  userId: string,
  provider: string,
  model: string,
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
): Promise<void> {
  const cost = calculateCost(model, usage.promptTokens, usage.completionTokens);

  await db.aiUsage.create({
    data: {
      userId,
      provider,
      model,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      cost,
      timestamp: new Date(),
    },
  });
}

export async function getUserUsage(
  userId: string,
  period: { start: Date; end: Date }
): Promise<UsageLog[]> {
  return db.aiUsage.findMany({
    where: {
      userId,
      timestamp: {
        gte: period.start,
        lte: period.end,
      },
    },
    orderBy: { timestamp: "desc" },
  });
}
```

## Streaming Implementation

```typescript
// app/api/ai/stream/route.ts
import { NextRequest } from "next/server";
import { getProvider } from "@/lib/ai/registry";
import { requireAuth } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

export async function POST(request: NextRequest) {
  const session = await requireAuth();

  // Check rate limit
  const rateLimit = await checkRateLimit(session.userId, session.tier);
  if (!rateLimit.allowed) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  const { provider, messages, options } = await request.json();

  // Get AI provider
  const aiProvider = getProvider(provider);

  // Create a ReadableStream for streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of aiProvider.stream(messages, options)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## Client-Side Usage

```typescript
// components/ai/chat.tsx
"use client";

import { useState } from "react";
import type { AIMessage } from "@/types/ai";

export function AIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openai",
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      const aiMessage: AIMessage = {
        role: "assistant",
        content: data.content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={isLoading}
      />
      <button onClick={handleSend} disabled={isLoading}>
        Send
      </button>
    </div>
  );
}
```

## Error Handling

```typescript
// lib/ai/errors.ts
export class AIError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: string
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class RateLimitError extends AIError {
  constructor(
    provider: string,
    public resetAt: number
  ) {
    super(`Rate limit exceeded for ${provider}`, provider, "RATE_LIMIT");
    this.name = "RateLimitError";
  }
}

export class InvalidAPIKeyError extends AIError {
  constructor(provider: string) {
    super(`Invalid API key for ${provider}`, provider, "INVALID_API_KEY");
    this.name = "InvalidAPIKeyError";
  }
}
```

## Best Practices

1. **Always validate permissions** before making AI calls
2. **Implement rate limiting** to prevent abuse
3. **Track costs** for billing and analytics
4. **Use streaming** for better UX with long responses
5. **Handle errors gracefully** with user-friendly messages
6. **Log usage** for monitoring and debugging
7. **Abstract providers** to allow easy switching
8. **Never expose API keys** to the client
9. **Implement timeouts** to prevent hanging requests
10. **Cache responses** when appropriate
