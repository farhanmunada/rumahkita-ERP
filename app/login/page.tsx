import React, { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata = {
  title: 'Masuk | Vola ERP Portal',
  description: 'Portal autentikasi sistem operasional Vola ERP',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat formulir...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
