import { cn } from '@/lib/utils';

type Props = {
  bookedCount: number;
  capacity: number;
};

export function StatusPill({ bookedCount, capacity }: Props) {
  const available = Math.max(0, capacity - bookedCount);
  const variant =
    available === 0 ? 'full' : available <= 2 ? 'filling' : 'available';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
        variant === 'available' && 'bg-emerald-100 text-emerald-700',
        variant === 'filling' && 'bg-amber-100 text-amber-800',
        variant === 'full' && 'bg-rose-100 text-rose-700',
      )}
      aria-label={`${bookedCount} of ${capacity} booked`}
    >
      {bookedCount}/{capacity}
    </span>
  );
}
