# CLAUDE.md - AI Assistant Guide for Code Challenge Platform

## Project Overview

A Korean-language AI/ML code challenge platform where users submit predictions (CSV files) to be scored against answer keys, with real-time leaderboards and community discussion.

**Live Goal:** Users create challenges, upload submissions, get scored (sync or async), and see leaderboard rankings.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React + TypeScript (strict) | 19.2.3 / TS 5.x |
| Styling | Tailwind CSS + shadcn/ui (new-york) | v4 |
| ORM | Prisma | 6.19.x |
| Database | SQLite | via file `dev.db` |
| Auth | NextAuth v5 (beta.30) | Credentials provider |
| Scoring | Custom CSV evaluation engine | Built-in |
| Icons | Lucide React | 0.563.x |
| Validation | Zod | 4.3.x |

## Directory Structure

```
/
├── prisma/
│   ├── schema.prisma          # Data models (7 models)
│   ├── migrations/            # SQLite migrations
│   └── seed.ts                # Dev seed data (2 users, 3 challenges)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes (REST)
│   │   │   ├── auth/          # NextAuth + registration
│   │   │   └── challenges/    # Challenge CRUD, submit, leaderboard, discussions
│   │   ├── challenges/        # Challenge pages (list, detail with tabs)
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── profile/           # User profile
│   │   ├── layout.tsx         # Root layout (Geist fonts, Header)
│   │   ├── page.tsx           # Home page
│   │   ├── providers.tsx      # NextAuth SessionProvider
│   │   └── globals.css        # Tailwind CSS
│   ├── components/
│   │   ├── layout/Header.tsx  # Navigation header
│   │   └── ui/                # shadcn/ui components (14 components)
│   └── lib/
│       ├── auth.ts            # NextAuth config (JWT + credentials)
│       ├── prisma.ts          # Prisma client singleton
│       ├── scoring.ts         # CSV scoring engine (RMSE, F1, Accuracy)
│       ├── eval-service.ts    # Async evaluation service (mock + EvalAI adapter)
│       ├── sample-data.ts     # GitHub Pages fallback data
│       └── utils.ts           # cn() utility for className merging
├── datasets/                  # Challenge dataset files (CSV)
├── uploads/                   # User submission files (gitignored)
├── public/                    # Static assets
├── 설계.md                     # System design document (Korean)
├── 구성.md                     # Issue/workflow template (Korean)
└── CLAUDE.md                  # This file
```

## Data Models (Prisma)

### Core Models
- **User** - email/password auth, nickname, tier (bronze/silver/gold), XP system
- **Challenge** - title, description, metric (rmse/f1/accuracy), status (upcoming/active/ended), date range, daily submit limit
- **Dataset** - file references (train.csv, answer.csv, sample_submission.csv) per challenge
- **Participant** - join relationship (unique per user+challenge)
- **Submission** - file upload, status (pending/queued/scoring/completed/error), public/private scores
- **Leaderboard** - best score per user per challenge, cached rank
- **Post** - discussion/announcement/tip per challenge

### Evaluation Models
- **EvaluationJob** - async evaluation tracking (submissionId, evalRunId, status, logs, timestamps)

### Key Constraints
- SQLite: single-writer, use transactions for concurrent updates
- Leaderboard: "best score only" policy with full rank recalculation
- Unique constraints: `(challengeId, userId)` on Participant, Leaderboard

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | User registration |
| GET/POST | `/api/auth/[...nextauth]` | No | NextAuth handlers |
| GET | `/api/challenges` | No | List challenges (?status=&search=) |
| GET | `/api/challenges/:id` | No | Challenge detail with datasets |
| POST | `/api/challenges/:id/join` | Yes | Join challenge |
| GET | `/api/challenges/:id/data` | Yes* | Download dataset file |
| POST | `/api/challenges/:id/submissions` | Yes | Upload submission file |
| GET | `/api/challenges/:id/submissions` | Yes | User's submission history |
| GET | `/api/challenges/:id/leaderboard` | No | Leaderboard rankings |
| GET/POST | `/api/challenges/:id/discussions` | Yes** | Discussion forum |
| POST | `/api/internal/eval/poll` | Internal | Poll pending evaluations |

*Requires participant status. **GET is public, POST requires auth.

## Scoring System

### Supported Metrics
- **RMSE** (Root Mean Squared Error) - lower is better
- **Accuracy** - higher is better (rounded predictions vs actuals)
- **F1 Score** - higher is better (binary classification)

### Evaluation Flow
1. User uploads CSV via `/api/challenges/:id/submissions`
2. File saved to `uploads/{challengeId}/{userId}_{timestamp}_{filename}`
3. Submission created with `status=queued`
4. Evaluation service processes submission:
   - **Sync mode** (default): scores immediately using built-in CSV engine
   - **Async mode**: creates EvaluationJob, scores via worker/poll
5. On completion: update Submission scores, recalculate leaderboard ranks
6. Award XP to user (+10 per successful submission)

### Leaderboard Recalculation
- Uses "best score only" policy
- Metric direction is auto-detected (higher/lower is better)
- Full rank recalculation within a transaction after each score update

## Development Commands

```bash
# Setup
npm install
npx prisma migrate dev        # Apply migrations
npx prisma db seed             # Seed dev data

# Development
npm run dev                    # Start dev server (http://localhost:3000)

# Database
npx prisma studio              # GUI for database
npx prisma migrate dev --name <name>  # Create new migration
npx prisma generate            # Regenerate client after schema changes

# Build & Quality
npm run build                  # Production build
npm run lint                   # ESLint

# Test Accounts (after seed)
# test@example.com / password123 (silver tier, 150 XP)
# user2@example.com / password123 (gold tier, 500 XP)
```

## Environment Variables

```bash
DATABASE_URL="file:./dev.db"            # SQLite database path
NEXTAUTH_SECRET="your-secret-key"       # NextAuth JWT secret
NEXTAUTH_URL="http://localhost:3000"    # NextAuth base URL
GITHUB_PAGES="true"                     # Enable static export mode (optional)
EVALAI_API_URL="http://localhost:8000"  # EvalAI service URL (optional, for future)
EVALAI_AUTH_TOKEN=""                     # EvalAI auth token (optional)
EVAL_MODE="sync"                        # "sync" (default) or "async"
```

## Conventions & Patterns

### Code Style
- **Language**: TypeScript strict mode, Korean UI strings
- **Components**: Server Components by default; `"use client"` only when needed
- **Imports**: `@/` alias maps to `src/`
- **API routes**: Next.js App Router `route.ts` pattern with `NextRequest`/`NextResponse`
- **Auth guard**: `const session = await auth()` then check `session?.user?.id`
- **DB access**: Always via `import { prisma } from "@/lib/prisma"`
- **Error responses**: `NextResponse.json({ error: "message" }, { status: code })`

### Architecture Rules (from 구성.md)
- **No microservices** - keep modular monolith structure
- **Minimal changes** - consistent with existing patterns
- **No new libraries** unless absolutely necessary (explain why if adding)
- **Modular monolith**: evaluation logic embedded in the app, not as a separate service

### File Naming
- Pages: `page.tsx` (App Router convention)
- API routes: `route.ts`
- Components: PascalCase (`Header.tsx`, `JoinButton.tsx`)
- Libraries: camelCase (`scoring.ts`, `eval-service.ts`)
- UI components: kebab-case (`dropdown-menu.tsx`) - shadcn/ui convention

### Database Conventions
- IDs: CUID (string), auto-generated
- Timestamps: `createdAt` (auto), `updatedAt` (auto on Leaderboard/Post)
- Status fields: string enums (not actual enums, for SQLite compatibility)
- Cascade deletes from Challenge to related models
- Transactions for any multi-step writes (especially leaderboard updates)

### Security Considerations
- File uploads: validate extension, size limits, store outside public dir
- Auth required for: submit, join, post creation, data download (participant-only)
- Daily submission limits per challenge
- Passwords: bcryptjs with 10 rounds
- No secrets in code; use environment variables

## Docker (Local Development)

```bash
docker-compose up              # Start all services
docker-compose up nextjs       # Start only the web app
```

Services:
- `nextjs`: Next.js app on port 3000, mounts SQLite volume
- Volume: `db-data` for SQLite persistence

## Testing Strategy

- No test framework currently installed
- For CI: create fresh SQLite DB per test run
- Recommended: Vitest for unit tests, Playwright for E2E
- Prisma migrations should be validated in CI: `npx prisma validate`

## Common Tasks for AI Assistants

### Adding a new API route
1. Create `src/app/api/<path>/route.ts`
2. Use `auth()` for protected routes
3. Use `prisma` for database operations
4. Return `NextResponse.json()` with appropriate status codes

### Adding a new page
1. Create `src/app/<path>/page.tsx`
2. Server Component by default; add `"use client"` only if interactive
3. Use shadcn/ui components from `@/components/ui/`
4. Korean language for user-facing strings

### Modifying the database schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <descriptive-name>`
3. Update seed script if needed (`prisma/seed.ts`)
4. Run `npx prisma generate` to update client types

### Adding scoring metrics
1. Add metric function in `src/lib/scoring.ts`
2. Add case in `calculateScore` switch statement
3. Update metric direction check in submit route (`isHigherBetter`)

## Deployment Notes

- **GitHub Pages**: Set `GITHUB_PAGES=true` for static export (limited functionality)
- **Node.js server**: Standard `npm run build && npm start` for full functionality
- **Docker**: Use provided `docker-compose.yml` for local development
- **SQLite limitation**: Single writer; not suitable for high-concurrency production. Consider PostgreSQL for production.
