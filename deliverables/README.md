# Submission — Delivery Slot Booking System

This folder collects every artifact the brief asks for in one place. The actual app lives at the repo root; the files here are pointers, supporting notes, and proof of work.

## Brief checklist

| Brief requirement | Where to find it |
| --- | --- |
| Source code (GitHub repo preferred) | The whole repo at the root of this directory tree |
| README — setup and run instructions | [`../README.md`](../README.md) → **Getting started** |
| README — technology stack used | [`../README.md`](../README.md) → **Tech stack** |
| README — assumptions made | [`../README.md`](../README.md) → **Assumptions** |
| Short note: AI tools used, how they helped, challenges | [`AI-USAGE-NOTE.md`](./AI-USAGE-NOTE.md) (also embedded in the main README) |

## Supporting documents in this folder

- [`AI-USAGE-NOTE.md`](./AI-USAGE-NOTE.md) — the standalone 2-paragraph note on AI tools, their value, and what I had to push back on.
- [`FEATURE-CHECKLIST.md`](./FEATURE-CHECKLIST.md) — a 1:1 mapping of every brief requirement to the file and function that implements it.
- [`SELF-EVALUATION.md`](./SELF-EVALUATION.md) — an honest self-rating against the six evaluation criteria, with the weak spots called out.
- [`test-results.txt`](./test-results.txt) — captured output of `npm test` showing all 17 Vitest cases passing (including the headline overbooking-concurrency test).
- [`e2e-results.txt`](./e2e-results.txt) — captured output of a 20-case end-to-end suite against the running dev server (real HTTP, fresh DB, concurrent bookings included). 20/20 PASS.
- [`E2E-NOTES.md`](./E2E-NOTES.md) — what the E2E run tested, the one regression it caught (a missed `page.tsx` write that left the scaffold home page in place), and the fix.

## Quickest possible review path

```bash
# from the repo root
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm test         # 17/17 should pass; see test-results.txt
npm run dev      # open http://localhost:3000
```
