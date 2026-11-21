# TaskVault — Personal Task & Learning Productivity Vault

**TaskVault** is a full-stack, production-minded personal productivity application designed for students, software engineers, and lifelong learners. It provides a central, distraction-free dashboard for saving unfinished LeetCode problems, online course sessions (NPTEL, Coursera, Udemy), video tutorials, documentation pages, and personal tasks—allowing you to record progress notes, track due dates, and return to tasks without searching through browser history.

Inspired by the clarity of **Notion** and the compact, keyboard-friendly ergonomics of **Linear**.

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [Prerequisites](#prerequisites)
5. [Local Development Setup](#local-development-setup)
6. [Environment Variables](#environment-variables)
7. [Supabase Setup & Database Migrations](#supabase-setup--database-migrations)
8. [Authentication Configuration](#authentication-configuration)
   - [Email / Password Setup](#email--password-setup)
   - [Google OAuth Setup](#google-oauth-setup)
9. [Development & Testing Commands](#development--testing-commands)
10. [Vercel Production Deployment](#vercel-production-deployment)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Security Architecture](#security-architecture)
13. [Remaining Manual Setup Steps](#remaining-manual-setup-steps)

---

## 1. Features

### Core Task Classification & Lifecycle
- **Three Core Statuses:**
  - `To Do`: Tasks you intend to work on or are actively tackling.
  - `Do Later`: Deliberately postponed tasks to return to at another time.
  - `Completed`: Retained finished tasks (never deleted automatically).
- **No Duplication:** Seamlessly move tasks between `To Do`, `Do Later`, and `Completed`.
- **Archive System:** Conceal tasks from active lists while preserving historical data. Restore to active status or trash anytime.
- **Trash (Soft Delete) with Instant Undo:** Accidental deletions are protected with an instant "Undo" toast notification. Permanent deletion is strictly separated.

### Automatic Metadata & SSRF-Protected Fetching
- **One-Click Link Saving:** Paste any URL (e.g., LeetCode, YouTube, GitHub, MDN, Documentation).
- **Auto-Fetch Metadata:** Automatically extracts page title, website hostname, favicon URL, and description preview.
- **SSRF Defense Architecture:**
  - Prohibits `javascript:`, `data:`, `file:`, and non-HTTP/HTTPS schemes.
  - Blocks DNS resolutions targeting loopback (`127.0.0.1/8`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and Cloud Metadata Services (`169.254.169.254`).
  - Implements strict 4-second fetch timeouts, 512KB payload limits, and max 3 validated redirects.
  - Safe fallbacks allow saving tasks manually even when remote sites block automated bots.

### Real Search, Filtering & Sorting
- **Multi-Field Search:** Real-time query matching across title, original URL, description, personal notes, categories, and tags.
- **Filter Pills:** Filter by Status, Category, Tag, Priority (`High`, `Medium`, `Low`), and Overdue status.
- **Multi-Criteria Sorting:** Sort by Newest Created, Oldest First, Recently Updated, Alphabetical (A-Z), Highest Priority, or Earliest Due Date.
- **Instant Reset:** View active filter count with a single-click "Clear all filters" button.

### Notes & Saved Progress
- **Resumption Context:** Keep notes on where you left off (e.g., *"Solved in O(n) space, optimize to O(1) next time"*).
- **Dedicated Progress Editor:** Edit and save notes directly inside the detail view with instant save feedback.

### Due Dates & Recently Opened Tracker
- **Overdue Detection:** Prominently flags overdue items across dashboard and list views without silently mutating status.
- **Last-Opened Tracking:** Records exact timestamps whenever a destination is launched from TaskVault.
- **Secure Destination Launch:** Opens external URLs with `rel="noopener noreferrer"` in a new tab.

### Design Aesthetics & Themes
- **Notion & Linear Inspired Layout:** Desktop left sidebar with real-time badges, mobile drawer navigation, clean typography, subtle borders, and smooth micro-transitions.
- **True Light & Dark Themes:** System preference detection on initial visit, smooth theme toggle, persisted in local storage.

---

## 2. Technology Stack

- **Framework:** Next.js 16 with App Router (Turbopack bundler)
- **Language:** TypeScript 5 (Strict mode)
- **Styling:** Tailwind CSS v4 with custom dark mode variants
- **Icons:** Lucide Icons (`lucide-react`)
- **Database:** Supabase PostgreSQL with Row-Level Security (RLS)
- **Authentication:** Supabase Auth (`@supabase/ssr` with cookie sessions)
- **Unit Testing:** Vitest (validation, SSRF defense, filtering, lifecycle tests)
- **E2E Testing:** Playwright (comprehensive user journeys)
- **Hosting & Deployment:** Vercel

---

## 3. Architecture & Folder Structure

```
WebPageManager/
├── .env.example                     # Environment template with configuration instructions
├── AGENTS.md                        # Project guidelines & agent conventions
├── eslint.config.mjs                # ESLint 9 Flat Config
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies and scripts
├── playwright.config.ts             # Playwright E2E configuration
├── tsconfig.json                    # TypeScript compiler options
├── vitest.config.ts                 # Vitest unit test configuration
├── public/                          # Static public assets
├── supabase/
│   └── migrations/
│       └── 20261029000000_taskvault_schema.sql # PostgreSQL schema, triggers & RLS policies
├── src/
│   ├── proxy.ts                     # Next.js 16 Proxy / Middleware session refresher
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx       # Sign In page (Google OAuth + Email)
│   │   │   ├── register/page.tsx    # Sign Up page
│   │   │   └── forgot-password/page.tsx # Password reset request
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Dashboard layout with desktop sidebar & mobile drawer
│   │   │   ├── dashboard/page.tsx   # Dashboard overview & summary stats
│   │   │   ├── todo/page.tsx        # Active To Do tasks view
│   │   │   ├── later/page.tsx       # Postponed Do Later tasks view
│   │   │   ├── completed/page.tsx   # Retained Completed tasks view
│   │   │   ├── archived/page.tsx    # Archived tasks view
│   │   │   ├── trash/page.tsx       # Soft-deleted trash view with permanent delete
│   │   │   └── settings/page.tsx    # User settings & Supabase connection status
│   │   ├── api/
│   │   │   ├── metadata/route.ts    # SSRF-protected URL metadata preview endpoint
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts         # GET tasks list, POST new task
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts     # GET single, PATCH update/lifecycle, DELETE permanent
│   │   │   │       └── open/route.ts # POST update last_opened_at timestamp
│   │   │   ├── categories/route.ts  # GET & POST user categories
│   │   │   └── tags/route.ts        # GET & POST user tags
│   │   ├── auth/
│   │   │   └── callback/route.ts    # Supabase OAuth/email callback handler
│   │   ├── globals.css              # Tailwind v4 styles, scrollbars, color variables
│   │   ├── layout.tsx               # Root HTML layout with providers & fonts
│   │   ├── not-found.tsx            # Custom 404 page
│   │   └── page.tsx                 # Root redirect to /dashboard
│   ├── components/
│   │   ├── auth/                    # LoginForm, RegisterForm, ForgotPasswordForm
│   │   ├── dashboard/               # DashboardOverview, StatCard, ProgressChart, QuickAddTask
│   │   ├── layout/                  # Sidebar, Header, MobileNav, ThemeToggle
│   │   ├── providers/               # ClientProviders wrapper
│   │   ├── tasks/                   # TaskCard, TaskList, TaskModal, TaskFilters, TaskDetailModal
│   │   └── ui/                      # Button, Input, Modal, Badge, Skeleton
│   ├── context/
│   │   ├── AuthContext.tsx          # Supabase auth session & user management
│   │   ├── ModalContext.tsx         # Global task modal control
│   │   ├── TaskContext.tsx          # Real-time task state, stats, and operations
│   │   ├── ThemeContext.tsx         # Light/dark theme toggle & persistence
│   │   └── ToastContext.tsx         # Notification toast system with action/undo callbacks
│   └── lib/
│       ├── ssrf-defense.ts          # Private IP checks, DNS lookup, safe HTML metadata parser
│       ├── task-utils.ts            # Task validation, filtering, sorting, and stats calculation
│       ├── utils.ts                 # Formatting utilities, cn helper, URL protocol validation
│       └── supabase/
│           ├── client.ts            # Browser createBrowserClient
│           ├── config.ts            # Environment verification helper
│           ├── middleware.ts        # SSR session refresher
│           ├── server.ts            # Server-side createServerClient
│           └── types.ts             # Database schema interfaces & types
└── tests/
    ├── e2e/
    │   └── task-vault-journeys.spec.ts # Full Playwright user journey suite
    └── unit/
        ├── lifecycle.test.ts        # Status transitions, archive & trash behavior
        ├── ssrf-defense.test.ts     # SSRF blocking & HTML extraction tests
        ├── task-utils.test.ts       # Filter, sort, priority & overdue calculations
        └── validation.test.ts       # Input & URL sanitization tests
```

---

## 4. Prerequisites

- **Node.js:** v18.18.0 or newer (v20+ or v22+ recommended)
- **Package Manager:** npm (bundled with Node.js)
- **Supabase Account:** Free account at [supabase.com](https://supabase.com)
- **Vercel Account:** Free account at [vercel.com](https://vercel.com)

---

## 5. Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd WebPageManager
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and paste your Supabase Project URL and Anon Key (see section below).

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

> [!NOTE]
> If you start the app without Supabase keys, TaskVault activates **Local Preview Mode** with pre-populated demo tasks so you can test the interface, theme toggle, and filters immediately.

---

## 6. Environment Variables

Create `.env.local` in the project root:

```ini
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Public Anon Key (safe for client-side use with RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Application Base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Public Keys vs. Secret Keys
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Safe for client-side JavaScript. All data access through this key is strictly enforced by PostgreSQL Row-Level Security (RLS) policies.
- **Service Role Secret Key:** **NEVER** expose the `service_role` key in `.env.local`, client-side code, or Git commits.

---

## 7. Supabase Setup & Database Migrations

1. Go to [database.new](https://database.new) and create a new project.
2. Once the project is provisioned, navigate to **SQL Editor** in the left sidebar.
3. Open `supabase/migrations/20261029000000_taskvault_schema.sql` from this workspace.
4. Copy the entire SQL content and paste it into the Supabase SQL Editor.
5. Click **Run**.

### What this migration creates:
- **`profiles` table:** User profile and UI preferences with `updated_at` triggers.
- **`categories` table:** User-scoped categories with default starter categories (Coding, Courses, Tutorials, Documentation, Projects, Reading, Personal).
- **`tags` table:** User-scoped tags with unique constraints.
- **`tasks` table:** Core tasks with URL, status, priority, due date, notes, and lifecycle timestamps (`completed_at`, `archived_at`, `deleted_at`, `last_opened_at`).
- **`task_tags` junction table:** Enforces many-to-many relationship with cascade deletion.
- **Performance Indexes:** Optimized B-tree indexes for `(user_id, status)`, `(user_id, deleted_at, archived_at)`, `due_date`, and `last_opened_at`.
- **Row-Level Security (RLS):** Complete `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies on all tables ensuring users can only read and mutate their own records.
- **Automatic User Signup Trigger:** Automatically creates a profile record and provisions default categories upon new user signup.

---

## 8. Authentication Configuration

### Email / Password Setup
1. In the Supabase dashboard, navigate to **Authentication** > **Providers** > **Email**.
2. Ensure **Enable Email provider** is turned **ON**.
3. (Optional for local testing): Disable "Confirm email" if you want new signups to sign in immediately without email confirmation.

### Google OAuth Setup
1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com).
2. Configure your **OAuth Consent Screen** (User type: External).
3. Navigate to **Credentials** > **Create Credentials** > **OAuth client ID** > **Web application**.
4. In **Authorized redirect URIs**, add your Supabase Auth callback URL:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
5. Copy the generated **Client ID** and **Client Secret**.
6. In Supabase Dashboard, go to **Authentication** > **Providers** > **Google**:
   - Toggle **Enable Google provider** to ON.
   - Paste **Client ID** and **Client Secret**.
   - Click **Save**.
7. In Supabase Dashboard, go to **Authentication** > **URL Configuration**:
   - Set **Site URL** to:
     - Local: `http://localhost:3000`
     - Production: `https://your-taskvault-app.vercel.app`
   - In **Redirect URLs**, add:
     - `http://localhost:3000/auth/callback`
     - `https://your-taskvault-app.vercel.app/auth/callback`

---

## 9. Development & Testing Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the production bundle and validates routes |
| `npm run start` | Starts the production server locally |
| `npm run lint` | Runs ESLint 9 across all TypeScript files |
| `npm run test` | Runs automated Vitest unit tests |
| `npx tsc --noEmit` | Runs full TypeScript compiler verification |
| `npx playwright test` | Executes end-to-end user journey test suite |

---

## 10. Vercel Production Deployment

1. **Push your code to a Git repository:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete TaskVault full-stack implementation"
   git branch -M main
   git remote add origin <your-git-repo-url>
   git push -u origin main
   ```

2. **Import into Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository and click **Import**.
   - Framework Preset: **Next.js** (automatically detected).

3. **Configure Production Environment Variables:**
   Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
   - `NEXT_PUBLIC_SITE_URL`: `https://<your-app-name>.vercel.app`

4. **Deploy:**
   - Click **Deploy**.
   - Vercel will build the application, optimize serverless functions, and deploy globally on Edge CDN.

5. **Update Supabase Production Callback URL:**
   - Once Vercel provides your production domain (`https://<app>.vercel.app`), return to Supabase Dashboard > **Authentication** > **URL Configuration**.
   - Update **Site URL** to your Vercel URL.
   - Add `https://<app>.vercel.app/auth/callback` to **Redirect URLs**.

---

## 11. Troubleshooting Guide

### 1. `Auth callback failed` or redirects to login with error
- **Cause:** Supabase Redirect URLs do not match the requesting domain.
- **Fix:** In Supabase Dashboard > Authentication > URL Configuration, ensure `http://localhost:3000/auth/callback` (for local development) or `https://<app>.vercel.app/auth/callback` (for production) is listed in **Redirect URLs**.

### 2. Tasks not saving or 401 Unauthorized
- **Cause:** Session token missing or expired, or RLS policy violated.
- **Fix:** Check that you are signed in. Confirm the user has run the initial SQL migration in `supabase/migrations/` so that RLS policies exist.

### 3. URL metadata shows generic fallback
- **Cause:** Remote website blocks automated scrapers (e.g. Cloudflare protection), or DNS resolution failed.
- **Fix:** TaskVault safely falls back to the hostname and allows manual title entry. Task creation is never blocked if metadata retrieval fails.

### 4. "Module not found: Can't resolve 'dns/promises' or 'net'"
- **Cause:** Server-side SSRF network utilities imported into a Client Component.
- **Fix:** Kept cleanly separated. Client components use browser-safe utilities in `@/lib/utils`, while Node.js networking remains in server route handlers.

---

## 12. Security Architecture

1. **Row-Level Security (RLS):**
   - Direct database access is restricted at the PostgreSQL engine level.
   - Every `SELECT`, `INSERT`, `UPDATE`, and `DELETE` query checks `auth.uid() = user_id`.
   - Users cannot inspect, modify, or delete another user's tasks, categories, or tags.

2. **SSRF Defense:**
   - Server-side metadata fetcher resolves DNS and validates IP addresses against private and link-local ranges.
   - Blocks AWS/GCP/Azure instance metadata endpoints (`169.254.169.254`).
   - Limits redirects and re-validates each destination against the SSRF filter.
   - 4-second request abort timeout and 512KB payload ceiling to prevent memory denial-of-service.

3. **External Link Hardening:**
   - All links opening user-saved URLs use `target="_blank"` with `rel="noopener noreferrer"` to prevent tab-nabbing vulnerabilities.

4. **Credential Isolation:**
   - No database passwords or Supabase `service_role` keys are ever committed, included in bundle outputs, or exposed to the browser.

---

## 13. Remaining Manual Setup Steps

To connect your own live cloud database and OAuth provider:
1. [ ] Create a project on [supabase.com](https://supabase.com).
2. [ ] Copy and run `supabase/migrations/20261029000000_taskvault_schema.sql` in the Supabase SQL Editor.
3. [ ] Copy your Supabase Project URL and Anon Key into `.env.local` (local) and Vercel Project Settings (production).
4. [ ] (Optional): Configure Google OAuth credentials in Google Cloud Console and add them in Supabase Authentication > Providers > Google.
5. [ ] Add `http://localhost:3000/auth/callback` and your production URL in Supabase Redirect URLs.
