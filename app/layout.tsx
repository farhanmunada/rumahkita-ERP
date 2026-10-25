import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/shared/components/Navbar';
import { SessionTimeoutWatcher } from '@/features/auth/components/SessionTimeoutWatcher';

export const metadata: Metadata = {
  title: {
    default: 'Vola ERP — Multi-Business Management & Invoice Hub',
    template: '%s | Vola ERP',
  },
  description: 'Sistem operasional, kalkulator HPP vendor broker, dan generator invoice multi-lini bisnis profesional standar A4',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <SessionTimeoutWatcher />
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto print:p-0 print:max-w-none">
          {children}
        </main>
      </body>
    </html>
  );
}
