'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { createBookingSchema } from '@/lib/schemas';
import type { SlotWithAvailability } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  slot: SlotWithAvailability;
  onClose: () => void;
  onBooked: () => void;
};

type FormValues = {
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
};

export function BookingModal({ slot, onClose, onBooked }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      slotId: slot.id,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
    },
  });

  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  const slotLabel = `${format(start, "EEE, d MMM 'at' h:mm a")} – ${format(end, 'h:mm a')}`;

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Booking confirmed for ${slotLabel}.`);
        onBooked();
        return;
      }
      const code = json?.error?.code;
      switch (code) {
        case 'SLOT_FULL':
          toast.error('This slot just filled up. Try the next available slot.');
          onBooked();
          break;
        case 'SLOT_NOT_FOUND':
          toast.error('Slot no longer exists.');
          onBooked();
          break;
        case 'INVALID_INPUT':
          toast.error(json.error.message ?? 'Please fix the highlighted fields.');
          break;
        default:
          toast.error('Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="booking-modal-title" className="text-lg font-semibold text-slate-900">
              Book delivery slot
            </h2>
            <p className="mt-1 text-sm text-slate-600">{slotLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('slotId')} />

          <Field label="Name" error={errors.customerName?.message}>
            <input
              type="text"
              autoComplete="name"
              className={inputClass(!!errors.customerName)}
              {...register('customerName')}
              ref={(el) => {
                register('customerName').ref(el);
                firstFieldRef.current = el;
              }}
            />
          </Field>

          <Field label="Email" error={errors.customerEmail?.message}>
            <input
              type="email"
              autoComplete="email"
              className={inputClass(!!errors.customerEmail)}
              {...register('customerEmail')}
            />
          </Field>

          <Field label="Phone (optional)" error={errors.customerPhone?.message}>
            <input
              type="tel"
              autoComplete="tel"
              className={inputClass(!!errors.customerPhone)}
              {...register('customerPhone')}
            />
          </Field>

          <Field label="Notes (optional)" error={errors.notes?.message}>
            <textarea
              rows={3}
              className={inputClass(!!errors.notes)}
              {...register('notes')}
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    'block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400',
    hasError ? 'border-rose-400' : 'border-slate-300',
  );
}
