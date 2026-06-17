'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SlotWithAvailability } from '@/lib/types';

type Props = {
  onSuggest: (slotId: string) => void;
};

export function NextAvailableButton({ onSuggest }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/slots/next-available', {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Request failed');
      const data = (await res.json()) as { slot: SlotWithAvailability | null };
      if (!data.slot) {
        toast.info('No slots available in the next 7 days.');
        return;
      }
      const when = format(new Date(data.slot.startsAt), "EEE, d MMM 'at' h:mm a");
      toast.success(`Next available: ${when}`);
      onSuggest(data.slot.id);
    } catch {
      toast.error('Could not fetch the next available slot.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 self-start rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 sm:self-auto"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CalendarClock className="h-4 w-4" />
      )}
      Suggest next available
    </button>
  );
}
