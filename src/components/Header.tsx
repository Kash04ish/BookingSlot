import type { ReactNode } from 'react';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Delivery Slot Booking
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pick a delivery time that works for you over the next seven days.
        </p>
      </div>
      {children}
    </header>
  );
}
