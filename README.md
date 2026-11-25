# auction-house

A tiny auction site for running a fun event with friends.

Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4, Supabase (Postgres + Google auth), Vercel.

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm run dev                  # http://localhost:3000
```

Scripts: `npm run typecheck`, `npm run lint`, `npm run format`.

## One-time setup

### 1. Supabase project

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Project Settings → API Keys**: copy the project URL and the publishable key into `.env.local`.
3. **Authentication → URL Configuration**:
   - Site URL: your Vercel URL (use `http://localhost:3000` until you deploy)
   - Redirect URLs (exact, no wildcards): `http://localhost:3000/auth/callback` and `https://<your-vercel-domain>/auth/callback`

### 2. Google OAuth

1. In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** (type: Web application). Set up the OAuth consent screen first if it asks.
2. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback` (Supabase shows the exact value in the Google provider panel).
3. In Supabase, go to **Authentication → Sign In / Providers → Google**, turn it on, and paste the client ID and secret.

While the consent screen is in **Testing** mode, only the Google accounts listed as test users can sign in. Either add your friends as test users or publish the app.

### 3. Vercel

1. Import `xukev22/auction-house` at [vercel.com/new](https://vercel.com/new).
2. Add the same two `NEXT_PUBLIC_SUPABASE_*` env vars.
3. Deploy, then add the Vercel domain to Supabase's Site URL and Redirect URLs (step 1.3).

## How auth works

- `proxy.ts` refreshes the Supabase session cookie on every request and redirects signed-out users to `/auth/login`.
- `/auth/login` starts Google OAuth; Google sends the user back through Supabase to `/auth/callback`, which exchanges the code for a session.
- `utils/supabase/{browser,server}.ts` hold the Supabase clients for client and server code.
