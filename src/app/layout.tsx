import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Delivery Slot Booking',
  description: 'Book a delivery time that works for you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen antialiased`}
      >
        <main className="container mx-auto max-w-6xl px-4 py-8">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
