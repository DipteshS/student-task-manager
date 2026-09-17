# Student Task Manager

A full-stack task management app built for the rhythm of academic life — courses, recurring
readings, group project deadlines, and everything in between. Built with Next.js, PostgreSQL,
and Prisma.

## Features

**Core**
- Create, edit, delete, duplicate, and mark tasks complete — including inline title editing and
  a right-click context menu (edit / duplicate / set priority / delete)
- Per-user accounts (email + password) — each student only sees their own tasks
- Search, status/priority/tag filters, sorting, and "smart lists" (Today, Upcoming, Overdue, No
  due date) with live counts
- Three views: **List**, drag-and-drop **Board** (Pending/Completed columns), and a month
  **Calendar**
- Courses (color-coded, created inline), multi-tag support, subtask checklists with a progress
  bar, and recurring tasks (daily/weekdays/weekly/monthly) that auto-create their next occurrence
  on completion
- Bulk actions (multi-select → complete/delete/set priority) with an undo-toast delete flow
  (optimistic removal, 6s grace period before the delete actually persists)
- A command palette (⌘K) with fuzzy task search, plus keyboard shortcuts (`n` new task, `/`
  focus search)

**Insights & motivation**
- Analytics dashboard: completions over the last 30 days, a tasks-by-course breakdown, current
  streak, completion rate, average time-to-complete
- A dismissible weekly digest banner ("You've completed X/Y tasks due this week")

**Platform**
- Light/dark/system theme, with a dedicated academic navy-and-gold visual identity in both modes
- Password reset flow (dev-mode: no email provider needed — see [Known limitations](#known-limitations))
- Settings page: profile (name/password), theme preference, course management
- A public landing page for logged-out visitors
- Accessible: focus-trapped dialogs with focus restore, `htmlFor`/`id`-paired labels, and text
  colors checked against WCAG AA contrast
- Unit tests (Vitest) and a GitHub Actions CI pipeline (lint, test, build — which typechecks)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers (REST API) |
| Database | PostgreSQL, accessed via Prisma ORM (v7, `pg` driver adapter) |
| Auth | Auth.js (NextAuth v5) — credentials provider, JWT sessions, bcrypt password hashing |
| Validation | Zod + React Hook Form |
| Drag & drop | dnd-kit (Board view) |
| Charts | Recharts (Analytics) |
| Command palette | cmdk |
| Theming | next-themes |
| Testing | Vitest |

## Architecture

The app is a single Next.js codebase serving both the UI and the API:

- **`src/app/`** — pages (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`,
  `/tasks`, `/calendar`, `/analytics`, `/settings`) and API route handlers under `src/app/api/`.
- Data-heavy pages (`tasks`, `calendar`, `analytics`, `settings`) are **Server Components**: each
  checks the session, fetches exactly what it needs directly from the database with Prisma, and
  hands serialized data to a client component for interactivity — no loading spinner on first
  paint.
- **`src/components/task-manager.tsx`** is the largest client component: it owns state for the
  task list, active filters/smart-list/view, selection, and dialogs, and calls the REST API for
  all mutations. Filtering/sorting/smart-lists happen client-side against the in-memory task
  list, since a student's task list is small enough that this stays fast and avoids a network
  round-trip per keystroke.
- **`src/lib/auth.ts`** configures Auth.js with a credentials provider: on sign-in it looks up
  the user by email and verifies the password hash with bcrypt, then issues a JWT session.
- **`src/app/api/tasks/`**, **`.../courses/`**, **`.../account/`**, **`.../password-reset/`** are
  REST endpoints, each scoped to `session.user.id` so users can only ever read or modify their
  own data. The task PATCH endpoint has two paths: a lightweight "quick update" for
  status/order/title/priority (used by drag-and-drop, inline edit, and the context menu) and a
  full validated update for the edit form — including replacing subtasks and rolling a
  completed recurring task forward to its next occurrence.
- **`prisma/schema.prisma`** — `User`, `Task`, `Course`, `Subtask`, and `PasswordResetToken`
  models. `Task` carries `courseId` (nullable FK), `tags` (Postgres native string array),
  `recurrence`, manual `order` (for Board reordering), and `completedAt` (used for streaks and
  analytics rather than relying on `updatedAt`).
- **Theming**: the entire palette (navy/gold/maroon/forest + `background`/`surface`) is defined
  as CSS custom properties in `globals.css`, redefined under `:root[data-theme="dark"]` for dark
  mode. Components reference the tokens (`text-navy-900`, `bg-surface`, …) rather than literal
  colors, so every component re-themes automatically. A small set of `brand-*` tokens is kept
  theme-invariant for UI chrome (nav bar, primary buttons) that must stay dark-navy regardless of
  the active theme.

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local install, Docker, or a free hosted instance like [Neon](https://neon.tech) or [Supabase](https://supabase.com))

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — your PostgreSQL connection string.
   - `AUTH_SECRET` — generate one with `npx auth secret`.

3. Run the database migrations to create the schema:

   ```bash
   npx prisma migrate dev
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), register an account, and start adding tasks.

### Other useful scripts

```bash
npm run build        # production build
npm run start         # run the production build
npm run lint           # lint the codebase
npm run test           # run the Vitest unit test suite
npm run db:studio     # open Prisma Studio to inspect data
npm run db:deploy     # apply migrations in production (no prompts)
```

## Testing & CI

Unit tests cover the pure logic layer — filtering/sorting (`task-helpers`), recurrence date math
(`recurrence`), streak calculation (`streak`), and Zod schema edge cases (`validations`) — under
`src/lib/__tests__/`. Run them with `npm run test`.

`.github/workflows/ci.yml` runs on every push/PR to `main`: install, lint, unit tests, and a
production build (against a placeholder `DATABASE_URL`, since the build never needs a live
database connection — Prisma connects lazily). Type-checking happens as part of that build step
rather than as a separate one, since `next build` runs a full TypeScript check itself.

## Known limitations

- **Password reset has no real email delivery.** There's no transactional email provider wired
  up, so the reset link is generated server-side and shown directly in the UI (and logged) rather
  than emailed. This is a deliberate scope decision for a project without a paid email service —
  swapping in a provider like [Resend](https://resend.com) would mean adding an API call in
  `src/app/api/password-reset/request/route.ts` instead of returning the link.
- **Board drag-and-drop** is implemented with the standard dnd-kit "multiple containers" pattern
  (verified by code review and partial interactive testing), but end-to-end dragging wasn't
  exercisable through this project's automated browser-testing tool, which doesn't fully
  replicate native pointer-drag gestures. Worth a manual check in your own browser.
- No real-time collaboration, calendar sync, or offline/PWA support — out of scope for this
  project's size, but noted as natural next steps.

## Deployment

- **App**: deploy to [Vercel](https://vercel.com) — connect the repo, set `DATABASE_URL` and
  `AUTH_SECRET` as environment variables, and it builds automatically (the `postinstall` script
  runs `prisma generate`).
- **Database**: any managed PostgreSQL works; [Neon](https://neon.tech) and
  [Supabase](https://supabase.com) both have generous free tiers well suited to this project. Run
  `npm run db:deploy` (or let your CI run it) against the production `DATABASE_URL` to apply
  migrations.
