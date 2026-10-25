'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, AlertCircle, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const reason = searchParams.get('reason');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal masuk ke sistem');
      }

      // Refresh penuh untuk memastikan state sesi dan navbar terupdate
      window.location.href = redirectPath;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-slate-50 border border-slate-200 mb-2 shadow-xs">
          <Image
            src="/icon-192.png"
            alt="Vola ERP"
            width={44}
            height={44}
            className="w-11 h-11 rounded-xl object-cover"
            priority
          />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vola ERP Portal</h1>
        <p className="text-xs text-slate-500">
          Sistem Operasional & Generator Invoice Multi-Bisnis
        </p>
      </div>

      {/* Notifikasi Idle Timeout */}
      {reason === 'idle_timeout' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Sesi berakhir otomatis karena tidak ada aktivitas selama 1 jam. Silakan masuk kembali.</span>
        </div>
      )}

      {/* Notifikasi Error */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Login */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Pengguna (Username)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              required
              autoFocus
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-9 text-sm"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kata Sandi (Password)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 text-sm"
              disabled={loading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2 font-semibold gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Sistem</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
        Keamanan sesi aktif otomatis diperbarui saat berinteraksi.
      </div>
    </div>
  );
}
