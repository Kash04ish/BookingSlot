'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { SlotCell } from './SlotCell';
import { BookingModal } from './BookingModal';
import { Skeleton } from './Skeleton';
import type { SlotWithAvailability } from '@/lib/types';

type Props = {
  highlightedSlotId: string | null;
};

export function SlotGrid({ highlightedSlotId }: Props) {
  const [slots, setSlots] = useState<SlotWithAvailability[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SlotWithAvailability | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    if (slots === null) {
      // initial load: keep null to show skeleton
    }
    fetch('/api/slots', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load slots');
        return (await res.json()) as { slots: SlotWithAvailability[] };
      })
      .then((data) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const byDay = useMemo(() => {
    if (!slots) return [] as { day: Date; items: SlotWithAvailability[] }[];
    const map = new Map<number, SlotWithAvailability[]>();
    for (const slot of slots) {
      const dayKey = startOfDay(new Date(slot.startsAt)).getTime();
      const arr = map.get(dayKey) ?? [];
      arr.push(slot);
      map.set(dayKey, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([day, items]) => ({ day: new Date(day), items }));
  }, [slots]);

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <p className="font-medium">Could not load slots.</p>
        <p className="mt-1">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
        >
          <Loader2 className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  }

  if (!slots) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
        No slots in this range yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {byDay.map(({ day, items }) => (
          <div key={day.toISOString()} className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">
              {format(day, 'EEE, d MMM')}
            </h3>
            <div className="space-y-2">
              {items.map((slot) => (
                <SlotCell
                  key={slot.id}
                  slot={slot}
                  highlighted={highlightedSlotId === slot.id}
                  onClick={() => setSelected(slot)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <BookingModal
          slot={selected}
          onClose={() => setSelected(null)}
          onBooked={() => {
            setSelected(null);
            refetch();
          }}
        />
      )}
    </>
  );
}
