# Feature checklist — brief requirements mapped to code

Each row maps a line from the brief to the exact file (and function) that implements it.

| Requirement | File | Function / element |
| --- | --- | --- |
| Store delivery slots with capacity | `prisma/schema.prisma` | `model Slot { startsAt, endsAt, capacity }` |
| Seed slots so the reviewer sees data on first load | `prisma/seed.ts` | `main()` — 7 days × hourly (09:00–18:00), capacity 5, idempotent upsert by `startsAt` |
| Book slots | `src/lib/booking.ts` | `bookSlot(input)` — validates, runs inside per-slot mutex + Prisma transaction |
| HTTP endpoint to book | `src/app/api/bookings/route.ts` | `POST /api/bookings` |
| Prevent overbooking | `src/lib/booking.ts` | `withSlotLock(slotId, ...)` mutex + `prisma.$transaction` re-check on `_count.bookings` |
| Test that the overbooking guarantee holds | `src/tests/booking.test.ts` | `'prevents overbooking under concurrent requests'` — 12 concurrent calls, capacity 5, asserts exactly 5 succeed |
| Suggest next slot (logic) | `src/lib/slots.ts` | `getNextAvailable()` — earliest future slot where `bookedCount < capacity` |
| Suggest next slot (HTTP) | `src/app/api/slots/next-available/route.ts` | `GET /api/slots/next-available` |
| Suggest next slot (UI) | `src/components/NextAvailableButton.tsx`, `src/app/page.tsx` | Click → fetch → toast → `scrollIntoView` + 2.5s ring highlight on the matching `[data-slot-id]` |
| Display availability | `src/components/SlotGrid.tsx` | Groups by day with `date-fns`, responsive grid 1→7 columns |
| Per-slot availability indicator | `src/components/SlotCell.tsx` + `StatusPill.tsx` | `bookedCount / capacity`, green / amber (≤2 left) / red, disabled when full |
| Validation (client) | `src/components/BookingModal.tsx` | `react-hook-form` + `zodResolver(createBookingSchema)` |
| Validation (server, defense in depth) | `src/lib/booking.ts` | `createBookingSchema.safeParse(input)` re-runs server-side |
| Shared Zod schemas | `src/lib/schemas.ts` | `createBookingSchema`, `listSlotsQuerySchema`, `emailQuerySchema` |
| Error contract | `src/lib/errors.ts` | `BookingError` + `toApiErrorResponse` → `{ error: { code, message, details? } }` |
| HTTP status mapping | `src/lib/errors.ts` | `INVALID_INPUT`→400, `SLOT_NOT_FOUND`→404, `SLOT_FULL`→409, `INTERNAL`→500 |
| Per-error UX in UI | `src/components/BookingModal.tsx` | `switch (json.error.code)` toasts; on 409 suggests trying the next slot |
| Loading state | `src/components/Skeleton.tsx`, used in `SlotGrid` | 7-column skeleton placeholder while `/api/slots` resolves |
| Empty state | `src/components/SlotGrid.tsx` | "No slots in this range yet." |
| Error state | `src/components/SlotGrid.tsx` | Red banner + retry button |
| Toast system | `src/app/layout.tsx` | `<Toaster richColors position="top-right" />` from `sonner` |
| Setup and run instructions | `README.md` | **Getting started** section |
| Tech stack docs | `README.md` | **Tech stack** table |
| Assumptions docs | `README.md` | **Assumptions** section |
| AI usage note | `README.md` + `deliverables/AI-USAGE-NOTE.md` | **AI-assisted development** section |

## Test summary

```
Test Files  3 passed (3)
Tests      17 passed (17)
```

See [`test-results.txt`](./test-results.txt) for the full output. Highlighted tests:

- `bookSlot › books a slot successfully when capacity is available`
- `bookSlot › throws SLOT_NOT_FOUND for an unknown slotId`
- `bookSlot › throws SLOT_FULL when the slot is already at capacity`
- `bookSlot › throws INVALID_INPUT when input fails validation`
- `bookSlot › prevents overbooking under concurrent requests` ← the headline correctness test
- `getNextAvailable › returns the earliest future slot with availability`
- `getNextAvailable › skips full slots and returns the next slot with room`
- `getNextAvailable › ignores past slots even if they have availability`
- `createBookingSchema › trims whitespace on name and email`
- `createBookingSchema › rejects notes longer than 500 characters`
