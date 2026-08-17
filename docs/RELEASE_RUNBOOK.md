# Release runbook

## Before a release

1. Confirm the working tree contains only intended Health Dashboard changes.
2. Run `pnpm install --frozen-lockfile`.
3. Run `pnpm test`.
4. Confirm `APP_VERSION`, the visible version, HTML query strings, manifest URLs and service-worker cache all use the same release number.
5. For data-model changes, verify that older dashboard JSON is migrated and that newer unknown versions are rejected.
6. For Telegram changes, verify the local Edge Function source and deploy it after the frontend commit is available on GitHub.

## Publish

1. Commit with a concise release description.
2. Push `main` to GitHub.
3. Wait for the GitHub Actions quality check and GitHub Pages deployment to finish.
4. Verify the live URL with the release query string, for example `https://benashy.github.io/health-tracker/?v=0.81`.
5. Check the signed-out screen on desktop and iPhone before signing in.
6. Sign in to one account and verify cloud refresh, one harmless measurement workflow and the footer version. Do not create test health data in the other account.

## Rollback

The local tag created before a release records the previous known state. Prefer a normal revert commit over rewriting Git history.

1. Revert the release commit and push the revert.
2. Confirm GitHub Pages serves the previous cache version.
3. If the Edge Function changed, redeploy its previous known source or wrapper commit.
4. Do not restore a database backup merely to roll back frontend code.
5. If live data was affected, stop edits, download the current account backup and follow the recovery procedure before changing anything further.

## Release evidence

Record the commit, app version, test result, Edge Function version when relevant, and the live URL checked. A successful push alone is not release verification.
