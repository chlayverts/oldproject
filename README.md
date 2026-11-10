# Kampus Unggul

A portfolio-ready e-learning prototype built with React, TypeScript, and Vite. The interface includes a course catalog, learner dashboard, calendar, quiz, profile, discussion topics, and learning-materials page.

## Stack

- React and TypeScript for the interface
- Vite for local development and production builds
- Supabase Auth and Postgres for optional hosted accounts and course enrollment
- Playwright for browser-level flows
- GitHub Actions for CI and GitHub Pages deployment

## Run locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Without Supabase environment variables, the app runs in local demo mode:

- Username: `student`
- Password: `kampus123`

Demo profile and enrollments are stored in this browser's local storage.

## Enable Supabase

1. Create a Supabase project.
2. Run [supabase/schema.sql](supabase/schema.sql) in the SQL Editor.
3. Copy `.env.example` to `.env.local` and set the project URL and publishable key:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

4. Restart the Vite server and register a user with the sign-up form.

The client uses only the publishable key. Never place a Supabase service-role key in browser code. Row Level Security policies in the SQL schema restrict profile and enrollment records to their owner.

To use Supabase on the GitHub Pages deployment, add repository Actions variables named `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Build and browser tests

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

The CI workflow builds the app and runs the browser flows on pushes and pull requests to `main`. On the repository's **Settings → Pages**, set the build and deployment source to **GitHub Actions** to publish the built app.

## Project structure

```text
src/
├── App.tsx                 # Screens and interactive flows
├── data/courses.ts         # Demo catalog data
├── lib/
│   ├── database.types.ts   # Supabase table types
│   ├── localStore.ts       # Local demo persistence
│   └── supabase.ts         # Optional Supabase client
└── styles.css              # Responsive interface
supabase/schema.sql         # Tables and row-level security policies
tests/e2e.spec.ts           # Playwright browser flows
```

## Scope

The local demo account is not real authentication. Supabase mode requires a project, the SQL schema, and repository or local environment variables. Forum topics, calendar entries, and learning materials are sample content; the materials page does not serve real downloads.

## Author

**Chlayverts** · [GitHub profile](https://github.com/chlayverts)
