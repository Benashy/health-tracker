# Health Tracker Privacy And Security Audit

Last updated: 2026-07-20

## Scope

This audit covers the public frontend repository, browser-visible configuration, local privacy guard, and the live Supabase `Health Tracker` project.

## Current Findings

- The app stores live data in Supabase, not in GitHub Pages files.
- The browser-visible Supabase config contains only the project URL and publishable key. No service-role key is present in the frontend code.
- `privacy-guard.js` hides private dashboard sections before approved Supabase login and clears private local data for unapproved sessions.
- Live Supabase Auth currently has 2 users; both are approved Health Tracker users.
- Live table `public.health_dashboard_data` exists with Row Level Security enabled.
- Live RLS policies require both:
  - the row `user_id` to match the signed-in user, and
  - the signed-in email to be one of the approved accounts.
- Live table grants were tightened during this audit:
  - `anon` now has no table privileges.
  - `authenticated` has only `SELECT`, `INSERT`, and `UPDATE`.
  - no browser role has `DELETE`, `TRUNCATE`, `REFERENCES`, or `TRIGGER` on the health data table.
- The checked-in SQL file has been updated to match the tightened live grant and policy model.
- Cloud save conflict protection remains in place via `updated_at`; the app only saves if the cloud row has not changed since this device last loaded it.
- Magic links use `shouldCreateUser: false`, so they should not create new accounts from the public app.

## Advisor Results

- Supabase security advisor remaining warning: leaked-password protection is disabled in Supabase Auth.
- Supabase performance advisor remaining info item: Auth DB connection strategy is absolute rather than percentage based. This is not important for the current two-user personal app.
- RLS init-plan performance warnings were fixed by wrapping `auth.jwt()` in a `select` inside policies.

## Recommended Follow-Up

- Enable leaked-password protection in Supabase Auth dashboard.
- Keep signups controlled; do not expose a public create-account flow.
- Re-run Supabase security/performance advisors after future schema changes.
- When PDF/document upload is added, create a separate Supabase Storage security audit before storing source reports.
- Backup scheduling remains separate and should use a private service-role key stored only on the Mac.

## Reference Links

- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API key docs: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase magic link docs: https://supabase.com/docs/guides/auth/auth-email-passwordless
- Supabase changelog: https://supabase.com/changelog
