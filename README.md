# Aegis AI

A full-stack application that provides secure access to Agentic AI platforms (ChatGPT, Gemini, etc.) with enterprise-grade authentication and authorization specifically designed for Small and Medium Enterprises (SMEs).

## Project Overview

**Aegis AI** enables SMEs to leverage powerful AI agents like ChatGPT and Gemini while maintaining control over access, usage, and security. The platform acts as a secure gateway, providing centralized authentication, authorization, and management capabilities for AI services.

### Key Features

- **Multi-AI Provider Integration**: Support for multiple agentic AI platforms (ChatGPT, Gemini, etc.)
- **Enterprise Authentication**: Secure user authentication and session management
- **Role-Based Authorization**: Fine-grained access control for different user roles and permissions
- **SME-Focused**: Tailored for small and medium enterprise requirements and constraints
- **Modern Full-Stack Architecture**: Built with industry best practices and modern tooling

### Tech Stack

This project follows modern best practices and utilizes cutting-edge tools:

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Lefthook for pre-commit validation
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager

### Development

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Project Structure

```
aegis-ai/
├── app/           # Next.js app router pages and layouts
├── components/    # React components
├── lib/           # Utility functions and shared code
├── public/        # Static assets
└── ...
```

## Development Guidelines

This project adheres to best practices:

- **Type Safety**: Strict TypeScript configuration
- **Code Quality**: Enforced linting and formatting rules
- **Git Workflow**: Pre-commit hooks ensure code quality before commits
- **Component Architecture**: Modular, reusable components
- **Modern Conventions**: Following latest Next.js and React patterns

## AI Assistant Context

When working on this project, please:

1. Follow the established TypeScript patterns and type safety practices
2. Maintain consistency with existing code style (enforced by ESLint/Prettier)
3. Use Next.js App Router conventions (Server Components by default)
4. Consider authentication/authorization implications for new features
5. Keep SME user experience and constraints in mind
6. Write clean, maintainable, and well-documented code

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
