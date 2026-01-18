# Aegis AI

A full-stack application that provides secure access to Agentic AI platforms (ChatGPT, Gemini, etc.) with enterprise-grade authentication and authorization specifically designed for Small and Medium Enterprises (SMEs).

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and OAuth credentials

# Push database schema to Supabase
pnpm db:push

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 📚 Documentation

- **[TESTING_QUICK_START.md](TESTING_QUICK_START.md)** - 5-minute setup guide
- **[AUTH_SETUP.md](AUTH_SETUP.md)** - Complete authentication setup
- **[DATABASE_TESTING.md](DATABASE_TESTING.md)** - Database testing guide

## Project Overview

**Aegis AI** enables SMEs to leverage powerful AI agents like ChatGPT and Gemini while maintaining control over access, usage, and security. The platform acts as a secure gateway, providing centralized authentication, authorization, and management capabilities for AI services.

### ✨ Key Features

- ✅ **Secure Authentication**: Email/password + Google OAuth with Auth.js v5
- ✅ **Role-Based Authorization**: Admin, user, and viewer roles with fine-grained permissions
- ✅ **Modern UI**: Beautiful, responsive design with Tailwind CSS v4
- ✅ **Type-Safe**: Full TypeScript with strict mode
- ✅ **Database**: Supabase PostgreSQL with Drizzle ORM
- 🚧 **Multi-AI Provider Integration**: Coming soon (ChatGPT, Gemini, etc.)
- 🚧 **Email Verification**: Coming soon
- 🚧 **Usage Analytics**: Coming soon

### 🛠️ Tech Stack

| Category        | Technology                                                   |
| --------------- | ------------------------------------------------------------ |
| Framework       | [Next.js 16](https://nextjs.org) (App Router, React 19)      |
| Language        | [TypeScript 5](https://www.typescriptlang.org) (strict mode) |
| Authentication  | [Auth.js v5](https://authjs.dev) (NextAuth.js)               |
| Database        | [Supabase](https://supabase.com) (PostgreSQL)                |
| ORM             | [Drizzle ORM](https://orm.drizzle.team)                      |
| Styling         | [Tailwind CSS v4](https://tailwindcss.com)                   |
| Validation      | [Zod](https://zod.dev)                                       |
| Code Quality    | ESLint 9, Prettier 3.8                                       |
| Git Hooks       | Lefthook                                                     |
| Package Manager | pnpm (required)                                              |

## 📁 Project Structure

```
aegis-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── actions/
│   │   └── auth.ts         # Server Actions for auth
│   ├── api/
│   │   └── auth/           # Auth.js API routes
│   ├── dashboard/          # Protected dashboard
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── lib/
│   ├── auth/
│   │   ├── password.ts     # Password hashing utilities
│   │   └── utils.ts        # Auth helper functions
│   ├── db/
│   │   ├── schema.ts       # Database schema (Drizzle)
│   │   └── index.ts        # Database client
│   └── validations/
│       └── auth.ts         # Zod validation schemas
├── types/
│   └── next-auth.d.ts      # Auth.js type extensions
├── auth.ts                 # Auth.js configuration
├── drizzle.config.ts       # Drizzle ORM configuration
└── .cursor/rules/          # AI assistant guidelines
```

## 🧪 Testing

### Database Setup

1. **Create Supabase project**: [supabase.com](https://supabase.com)
2. **Get connection string**: Settings → Database → Connection Pooling (Transaction mode)
3. **Configure `.env.local`**:
   ```env
   DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
   AUTH_SECRET=$(openssl rand -base64 32)
   AUTH_GOOGLE_ID=your-google-oauth-id
   AUTH_GOOGLE_SECRET=your-google-oauth-secret
   ```
4. **Push schema**: `pnpm db:push`

### Manual Testing

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Open Drizzle Studio (database UI)
pnpm db:studio
```

Test flows:

1. Signup: `/signup` → Create account → Check `users` table
2. Login: `/login` → Sign in → Redirect to dashboard
3. Protected routes: Access `/dashboard` without auth → Redirect to login
4. Google OAuth: "Continue with Google" → Authorize → Check `accounts` table

See [DATABASE_TESTING.md](DATABASE_TESTING.md) for detailed test scenarios.

## 📜 Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm db:push      # Push schema to database (dev)
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations (production)
pnpm db:studio    # Open Drizzle Studio (database UI)

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors
pnpm format       # Format with Prettier
pnpm type-check   # TypeScript type checking
```

## 🔐 Security Features

- ✅ **Password Security**: bcrypt hashing (12 rounds)
- ✅ **Session Management**: JWT sessions, HTTP-only cookies
- ✅ **Input Validation**: Zod schemas, server-side validation
- ✅ **SQL Injection Protection**: Parameterized queries (Drizzle)
- ✅ **OAuth Security**: Google OAuth 2.0 with proper redirect validation
- ✅ **Environment Variables**: Never expose secrets to client
- ✅ **Type Safety**: Full TypeScript prevents runtime errors

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (Supabase connection string)
   - `AUTH_SECRET` (generate new for production)
   - `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
   - `AUTH_URL` (auto-detected by Vercel)
4. Deploy!

**Important**: Update Google OAuth redirect URI with production URL:

- `https://your-domain.com/api/auth/callback/google`

### Environment Variables

Required for production:

```env
DATABASE_URL=          # Supabase pooler URL
AUTH_SECRET=           # Generate: openssl rand -base64 32
AUTH_GOOGLE_ID=        # From Google Cloud Console
AUTH_GOOGLE_SECRET=    # From Google Cloud Console
```

## 🗺️ Roadmap

- [x] Authentication system (email/password, Google OAuth)
- [x] Role-based access control
- [x] Protected routes and middleware
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] OpenAI API integration
- [ ] Google Gemini integration
- [ ] Usage tracking and analytics
- [ ] Admin dashboard
- [ ] API rate limiting
- [ ] Audit logging

## 🤝 Contributing

This is a private project. When working with AI assistants:

1. Follow TypeScript patterns and type safety practices
2. Maintain code style (enforced by ESLint/Prettier)
3. Use Next.js App Router conventions
4. Consider authentication/authorization implications
5. Keep SME user experience in mind
6. Write clean, well-documented code

See [`.cursor/rules/`](.cursor/rules/) for detailed guidelines.

## 📖 Learn More

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Auth.js v5 Docs](https://authjs.dev)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)

## 📄 License

Private project - All rights reserved
