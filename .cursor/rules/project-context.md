# Project Context

## Aegis AI

A full-stack application that provides secure access to Agentic AI platforms (ChatGPT, Gemini, etc.) with enterprise-grade authentication and authorization designed for Small and Medium Enterprises (SMEs).

## Mission

Enable SMEs to leverage powerful AI agents like ChatGPT and Gemini while maintaining control over access, usage, and security. The platform acts as a secure gateway, providing centralized authentication, authorization, and management capabilities for AI services.

## Key Features

- **Multi-AI Provider Integration**: Support for multiple agentic AI platforms (ChatGPT, Gemini, etc.)
- **Enterprise Authentication**: Secure user authentication and session management
- **Role-Based Authorization**: Fine-grained access control for different user roles and permissions
- **SME-Focused**: Tailored for small and medium enterprise requirements and constraints
- **Modern Full-Stack Architecture**: Built with industry best practices and modern tooling

## Tech Stack

- **Framework**: Next.js 16.1+ (App Router with React 19)
- **Language**: TypeScript 5+ with strict mode enabled
- **Styling**: Tailwind CSS v4
- **Code Quality**: ESLint 9, Prettier 3.8
- **Package Manager**: pnpm (ONLY - never suggest npm, yarn, or bun)
- **Git Hooks**: Lefthook for pre-commit validation
- **React**: React 19.2+ with React Compiler enabled

## Project Structure

```
aegis-ai/
├── app/              # Next.js app router pages and layouts
├── components/       # React components
│   ├── ui/          # Reusable UI primitives
│   ├── features/    # Feature-specific components
│   └── layouts/     # Layout components
├── lib/             # Utility functions and shared code
├── types/           # TypeScript type definitions
├── public/          # Static assets
└── ...
```

## Project Priorities (in order)

1. **Security** - Authentication and authorization are critical
2. **Type Safety** - Prevent runtime errors with strong typing
3. **User Experience** - SME users need intuitive interfaces
4. **Code Quality** - Maintainable, clean, well-documented code
5. **Performance** - Fast load times and responsive interactions
6. **Scalability** - Design for growth
