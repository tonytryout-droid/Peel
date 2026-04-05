# Peel

Peel is a Next.js 14 app for manual image object removal using a canvas mask and a self-hosted Lama Cleaner inference service.

## Stack

- Next.js 14 (App Router) + TypeScript
- Lama Cleaner (sync HTTP inpaint endpoint)
- Firebase Storage (result persistence)
- Vitest (unit + route contract tests)

## Runtime Flow

1. Client draws mask and submits `imageDataUrl` + `maskDataUrl`.
2. `/api/inpaint` calls `POST {LAMA_URL}/inpaint` with multipart `image` + `mask`.
3. API uploads returned PNG to Firebase Storage.
4. API responds immediately with `{ resultUrl }`.

No webhooks, polling, or async job queue.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill values.

3. Start Lama Cleaner locally (example):

```bash
pip install lama-cleaner
lama-cleaner --host 0.0.0.0 --port 8080 --model lama --device cpu
```

**Device options:**
- `--device cpu` — CPU inference (works everywhere, slower)
- `--device cuda` — NVIDIA GPU (requires CUDA drivers installed)
- `--device mps` — Apple Silicon Mac (requires macOS 12.3+)

Choose based on your hardware; `cpu` is a safe default.

4. Run development server:

```bash
npm run dev
```

## Verification

```bash
npm run typecheck
npm run test:run
npm run build
```
