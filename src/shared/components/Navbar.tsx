'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Users, Building2, LayoutDashboard, Plus, Calculator, LogOut } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Jangan tampilkan navbar di halaman login atau cetak invoice
  if (pathname === '/login' || /^\/invoices\/\d+\/print$/.test(pathname)) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/clients', label: 'Klien', icon: Users },
    { href: '/calculator', label: 'Kalkulator HPP', icon: Calculator },
    { href: '/settings/businesses', label: 'Unit Bisnis', icon: Building2 },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 tracking-tight">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm shadow-sm">
                RK
              </span>
              <span>RK-ERP</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Invoice</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari sesi"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
