'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StatusPill } from './StatusPill';
import type { SlotWithAvailability } from '@/lib/types';

type Props = {
  slot: SlotWithAvailability;
  highlighted?: boolean;
  onClick: () => void;
};

export function SlotCell({ slot, highlighted, onClick }: Props) {
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  const isFilling = !slot.isFull && slot.available <= 2;

  return (
    <button
      type="button"
      data-slot-id={slot.id}
      disabled={slot.isFull}
      onClick={onClick}
      title={slot.isFull ? 'Fully booked' : 'Book this slot'}
      className={cn(
        'group flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-left text-sm shadow-sm transition',
        'border-slate-200',
        !slot.isFull &&
          'hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 cursor-pointer',
        slot.isFull && 'opacity-60 cursor-not-allowed',
        !slot.isFull && !isFilling && 'border-l-4 border-l-emerald-400',
        isFilling && 'border-l-4 border-l-amber-400',
        slot.isFull && 'border-l-4 border-l-rose-300',
        highlighted &&
          'ring-2 ring-offset-2 ring-sky-500 animate-pulse',
      )}
    >
      <span className="font-medium tabular-nums text-slate-800">
        {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
      </span>
      <StatusPill bookedCount={slot.bookedCount} capacity={slot.capacity} />
    </button>
  );
}
