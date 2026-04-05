# Peel

Peel is a Next.js 14 app for manual image object removal using a canvas mask and Replicate LaMa inpainting.

## Stack

- Next.js 14 (App Router) + TypeScript
- Firebase Storage (client uploads)
- Firestore (job + idempotency tracking)
- Replicate (async inpainting via webhook)
- Vitest (unit + route contract tests)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill all values.

3. Run development server:

```bash
npm run dev
```

## Verification

```bash
npm run typecheck
npm run test:run
npm run build
```

## Hardened MVP Features Included

- Firestore-only job orchestration (`jobs`, `job_idempotency`)
- Request hash idempotency to prevent duplicate inference cost
- Replicate webhook signature verification + replay window
- Render-safe state transitions in React (`useEffect`)
- Pixel guard (`max 4,000,000`) before upload
- Display-scale brush with full-resolution hidden mask export
- Adaptive polling fallback with backoff
- Structured per-job telemetry (`jobs/{jobId}/events` + server logs)
