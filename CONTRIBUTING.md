# Contributing to trestly-app

Thanks for looking at this. This is the Next.js frontend for Trestly — connect
a Freighter wallet, create an escrowed x402 payment, and manage its
dispute/release/resolve lifecycle against the
[trestly-contract](https://github.com/Trestly-team/trestly-contract)
Soroban contract via [trestly-sdk](https://github.com/Trestly-team/trestly-sdk).

## Prerequisites

- Node.js 20+
- The [Freighter](https://www.freighter.app/) browser extension, to actually
  exercise the wallet-connected flows
- Testnet XLM in your Freighter wallet — fund it free via
  [Friendbot](https://friendbot.stellar.org?addr=YOUR_ADDRESS)

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in NEXT_PUBLIC_CONTRACT_ID, etc.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building, linting, testing

```bash
npm run lint
npm run build
```

CI runs both on every push and pull request to `main`.

## Project layout

- `app/page.tsx` — marketing/landing page
- `app/app/page.tsx` — the actual app: connect wallet, create payment, view
  status
- `components/CreatePaymentForm.tsx`, `components/PaymentStatusCard.tsx` —
  the two core flows
- `lib/wallet-context.tsx` — Freighter integration (`requestAccess()` to
  connect, `getAddress()`/`isConnected()` for a silent on-mount check —
  see the comments there if you're touching this, the two calls have
  meaningfully different behavior)
- `lib/trestly-config.ts` — reads `NEXT_PUBLIC_*` env vars into the SDK config
- `vendor/trestly-sdk/` — a vendored copy of trestly-sdk's built output (see
  "Why is the SDK vendored?" below)
- `docs/` — the documentation set synced to GitBook

## Why is the SDK vendored?

`trestly-app` depends on `trestly-sdk`, developed in a sibling repo. Vercel
(and any other host that clones just this repo) never sees that sibling
directory, so a plain `"trestly-sdk": "file:../trestly-sdk"` dependency
breaks in production even though it works locally. `vendor/trestly-sdk/`
is a copy of trestly-sdk's built `dist/` checked into this repo so the
dependency resolves from a path Vercel actually has.

If you change `trestly-sdk`, you need to rebuild it and copy the new
`dist/` (and `package.json`) into `vendor/trestly-sdk/` here, then run
`npm install` again to refresh the lockfile. Publishing trestly-sdk to npm
properly (removing the need for this) is a tracked open issue.

## Making a change

1. Fork and branch off `main`.
2. Run `npm run lint` and `npm run build` locally before opening a PR.
3. If you touch a wallet-connected flow, test it manually with Freighter —
   there's no automated test suite for this repo yet (also a tracked open
   issue).
4. Open a PR against `main`. CI must pass before review and merge. See the
   repository settings for the current branch-protection policy.

## Reporting issues

Open a GitHub issue. If you're picking up an issue that's part of a
[Drips Wave](https://www.drips.network/wave/stellar) cycle, it'll be labeled
accordingly — read the acceptance criteria in the issue body before starting.
