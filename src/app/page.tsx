'use client';

import { useCallback, useState } from 'react';
import { Header } from '@/components/Header';
import { NextAvailableButton } from '@/components/NextAvailableButton';
import { SlotGrid } from '@/components/SlotGrid';

export default function HomePage() {
  const [highlightedSlotId, setHighlightedSlotId] = useState<string | null>(null);

  const handleSuggest = useCallback((slotId: string) => {
    setHighlightedSlotId(slotId);
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-slot-id="${slotId}"]`);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    window.setTimeout(() => setHighlightedSlotId(null), 2500);
  }, []);

  return (
    <div>
      <Header>
        <NextAvailableButton onSuggest={handleSuggest} />
      </Header>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Filling fast (2 or fewer left)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Full
        </span>
      </div>

      <SlotGrid highlightedSlotId={highlightedSlotId} />
    </div>
  );
}
