# AI-assisted development — short note

## Tools used

I used **Claude Code (Claude Opus 4.7, 1M context)** as my single AI pair for the entire build, driving it from a Mac terminal. The workflow was plan-first: I asked Claude to enter plan mode, agree on the stack and data model, and only then write code. I did not switch tools mid-project — I wanted the conversation history to act as a record of the decisions, including the ones I disagreed with.

## How it helped

It compressed the busywork. Within a few minutes I had a Next.js 14 + Prisma + SQLite scaffold, a typed Zod schema reused on both sides of the wire, route handlers, a slot grid, a booking modal with react-hook-form, a Vitest setup that uses an isolated `test.db`, and a 17-test suite — including the concurrency test that fires 12 simultaneous bookings at a capacity-5 slot. It also drafted the README, which I edited rather than wrote from scratch. Where it was most useful was reasoning out loud about the overbooking problem with me, rather than producing code I'd already designed.

## Challenges I pushed back on

The first cut of the booking logic used `prisma.$transaction(..., { isolationLevel: 'Serializable' })`, which the Prisma docs imply is portable but actually is not honoured by the SQLite driver — under 12 concurrent requests the tests failed with `Transaction not found` and `PrismaClientKnownRequestError` instead of clean `SLOT_FULL` rejections. I rejected the suggestion to just bump timeouts and instead asked for a two-layer fix: a small per-slot in-process mutex that serializes capacity-check-and-insert in JavaScript, layered on top of the Prisma transaction. The mutex makes the test deterministic and matches what real production code would do; the transaction is still there so the booking is atomic at the DB level. That trade-off — and the fact that the mutex assumes a single Node process — is documented in the README's *Overbooking strategy* section. I also tightened the UX (the *Filling fast* amber state when 2 or fewer slots are left, the scroll-and-highlight when the user clicks *Suggest next available*) which the AI did not propose unprompted. The other tension was scope: it kept volunteering features like cancellation, an admin view, and ICS export. I kept the surface area small so the booking guarantee could be provably correct.
