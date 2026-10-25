import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/shared/components/Navbar';

export const metadata: Metadata = {
  title: 'RK-ERP — Multi-Business Invoice Generator',
  description: 'Aplikasi pencatatan dan pembuatan invoice multi-lini bisnis profesional standar A4',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto print:p-0 print:max-w-none">
          {children}
        </main>
      </body>
    </html>
  );
}
