# Ayoreni app: rules for Claude sessions

This is the **UI session's** repo. Before you work, read the private shared repo `jai38/ayoreni-docs`: its `CLAUDE.md` holds the full non-negotiable rules, and `docs/STATUS.md`, `docs/WORKING-AGREEMENT.md`, the current phase brief and `docs/contracts/api.md` hold the rest. When you stop, update the UI section of `docs/STATUS.md` there.

**Design source of truth:** https://claude.ai/artifact/7f6T8pLUF6V4CTzCKeYmU9 (the owner's work-account canvas). Build screens to match it, using the `design/` system (tokens, typography, components). If a screen needs data or an endpoint the API doesn't have, don't invent it: add it to `docs/contracts/ui-needs.md` and open a `from-ui` issue in `jai38/myhealthapp-backend`.

## Stack and commands

Expo SDK 57, React Native 0.86, React 19.2, TypeScript 6 strict, Expo Router. `.npmrc` sets `legacy-peer-deps=true`.

```bash
npm ci
npm run typecheck
npx vitest run
npm run start:dev | start:prod | start:local      # which API the app talks to
npx expo start --web --port 8081                   # web build for previews
node scripts/screens.mjs --out <dir>               # screenshots of /dev/preview states
```

The dev-only screen preview at `/dev/preview/<today|records|medicines|profile>?state=…&fontScale=2` renders the real screens from synthetic fixtures, with no backend. Use it for before/after screenshots at 360×800, 430×932 and a large font size.

## Deploys

A push to `main` deploys GitHub Pages and builds an Android APK. Work on the phase branch (`phase-N/...`), open a PR, and merge only when the owner says.

## Rules you will touch most here

- Every user-visible string goes through `t()` (`design/strings/en.ts`). Screens use only `design/` tokens and components.
- Dose labels come only from `doseStatusDisplay`. An unrecorded past dose is "Not confirmed", never Taken or Missed.
- Notification delivery, dismissal or snooze never marks a dose Taken. Paused, stopped and future doses offer no Taken or Skip.
- AI output is a draft until the patient confirms it. Uncertain values are flagged, never guessed. `nameAsWritten` stays separate from `normalizedMedicineName`.
- No secrets in the bundle. No health data in logs. Never send `patientProfileId`; identity comes from the token.
- Touching a clinical rule requires a regression test. Layout work adds render tests where the brief asks for them.
