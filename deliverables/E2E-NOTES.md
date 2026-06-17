# End-to-end test run — notes and fixes

## What I ran

A 20-case E2E pass against a freshly reset + reseeded database, hitting the running Next.js dev server through the real HTTP layer:

1. Homepage HTML SSR sanity (title + key copy in initial markup)
2. `GET /api/slots` returns a non-trivial slot count
3. `GET /api/slots/next-available` returns a slot id
4. `POST /api/bookings` — valid input → 201 + response shape
5. `POST /api/bookings` — invalid email → 400 + `code: INVALID_INPUT`
6. `POST /api/bookings` — empty name → 400
7. `POST /api/bookings` — unknown slotId → 404 + `code: SLOT_NOT_FOUND`
8. `bookedCount` increments after a successful POST
9. **12 concurrent POSTs** to a fresh capacity-5 slot via real HTTP — exactly 5 return 201, exactly 7 return 409
10. The DB shows exactly 5 bookings on that slot afterwards
11. The slot is now `isFull: true`
12. A 13th POST to the now-full slot → 409 + `code: SLOT_FULL`
13. `GET /api/bookings?email=…` returns the booking history
14. `GET /api/slots/next-available` skips the full slot

Full output is captured in [`e2e-results.txt`](./e2e-results.txt).

## What broke and what I fixed

**First run: 19/20 passing.** The failing case was `homepage shows suggest button` — the SSR HTML for `/` did not contain the button text or any of the page's static copy.

**Root cause:** during the initial parallel batch of UI file writes, three writes silently collided with files that already existed (`page.tsx`, `layout.tsx`, `globals.css`). The Write tool requires reading those files first. I noticed `layout.tsx` and `globals.css` failed and re-read + re-wrote them, but I missed that `page.tsx` had also failed — so the homepage was still the Next.js scaffold ("Get started by editing src/app/page.tsx") even though every other UI file was in place. Unit tests and `npm run build` did not catch this because they don't import `page.tsx`; only opening the homepage exposes it.

**Fix:** read the file, overwrite it with the intended client-component home page that mounts `<Header>`, `<NextAvailableButton>`, the legend, and `<SlotGrid>`. Hot-reload picked it up; the second E2E run is **20/20 PASS**.

**Why I'm keeping this in the deliverables:** this is exactly the kind of regression a UI test would have caught earlier. It's worth being transparent about the slip and the catch.
