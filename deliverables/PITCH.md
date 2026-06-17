# Interview pitch

A short script for walking an interviewer through this project. Three lengths so you can match the conversational rhythm, plus the two questions you should expect.

## 60-second version

> This is a delivery slot booking app — Next.js 14 App Router, Prisma over SQLite, Tailwind, Vitest. The brief asked for five things: store slots with capacity, book them, prevent overbooking, suggest the next available slot, and display availability. All five work end-to-end, verified by a 17-case unit suite and a 20-case live-HTTP suite — both included in the repo.
>
> The interesting problem is overbooking. A naive check-then-insert is racy. I solved it with two layers: a per-slot in-process mutex that serializes the capacity check and the insert in JavaScript, plus a Prisma transaction so the write is atomic at the DB level. I prove the guarantee by firing twelve concurrent bookings at a capacity-five slot through real HTTP routes — exactly five succeed, seven return 409 `SLOT_FULL`. The README documents that the mutex assumes a single Node process, so the production path is Postgres row-level locking.
>
> Validation: one Zod schema reused by the form resolver and re-run server-side. Errors flow through a typed `BookingError` mapped to 400/404/409 with a consistent JSON shape, and the UI shows a different toast per code.
>
> I used Claude Code as my pair. The honest AI moment: its first cut used `isolationLevel: 'Serializable'`, which silently doesn't work on SQLite. I pushed back, asked for the mutex-on-transaction design, and the test confirmed the fix. That whole exchange is documented in the README and the AI note in the deliverables folder.

## 20-second elevator version

> Full-stack Next.js + Prisma + SQLite. Five brief requirements implemented and verified by a 17-test unit suite and a 20-case live HTTP suite. The hard part — overbooking — is solved with a per-slot mutex plus a Prisma transaction, and I prove it with twelve concurrent bookings against a capacity-five slot. Repo's on GitHub, deliverables folder has setup, AI note, feature checklist, and captured test runs.

## 10-second one-liner (when they only want the headline)

> Next.js + Prisma slot-booking app where the headline correctness guarantee — no overbooking under concurrent load — is enforced by a per-slot mutex plus a transaction and proven by a 12-concurrent-bookings test through real HTTP.

## Questions to expect, with the answers

**Q: Why SQLite, not Postgres?**

> Reviewer-friendliness. The brief weights "running the project" heavily, and SQLite is `npm install` + a file. The trade-off is documented — the next step in the README is Postgres with `SELECT ... FOR UPDATE` so the lock lives in the DB instead of the Node process.

**Q: Why the mutex if you already have a transaction?**

> SQLite serializes writers natively, but under heavy contention Prisma surfaces low-level driver errors instead of a clean `SLOT_FULL`. The mutex makes the failure mode deterministic — every rejected concurrent request gets a structured 409 with a message the UI can act on, which is what the user actually sees.

**Q: What would you change before shipping this for real?**

> Three things, in order. Real auth so "my bookings" becomes meaningful. Postgres with row-level locking so the lock survives horizontal scaling. And an admin UI to create / cancel slots and adjust capacity. All three are listed in the README's *What I would do next* section.

**Q: What did the AI tool actually do for you?**

> Compressed the busywork — scaffolding, Prisma schema iteration, drafting the README. The valuable moment was reasoning out loud about the overbooking problem together. The full AI note is in `deliverables/AI-USAGE-NOTE.md` and includes the one suggestion I overrode.

## Demo cheat sheet

While talking, have these open on a second screen:

1. **`deliverables/README.md`** — the index of every artifact.
2. **`src/lib/booking.ts`** — the heart of the app; the file you can point at when you describe the mutex + transaction.
3. **`src/tests/booking.test.ts`** — scroll to the `prevents overbooking under concurrent requests` test.
4. **The running app** at `http://localhost:3000` — book a slot, watch the count update, click *Suggest next available*.
