'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ONE_HOUR_MS = 60 * 60 * 1000; // 3.600.000 ms (1 jam)
const TOUCH_INTERVAL_MS = 2 * 60 * 1000; // 2 menit throttle keepalive

export function SessionTimeoutWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const lastActiveRef = useRef<number>(Date.now());
  const lastTouchRef = useRef<number>(Date.now());

  useEffect(() => {
    // Lewatkan watcher jika di halaman login atau print publik
    if (pathname === '/login' || /^\/invoices\/\d+\/print$/.test(pathname)) {
      return;
    }

    const handleUserActivity = () => {
      const now = Date.now();
      lastActiveRef.current = now;

      // Throttle pengiriman refresh token ke server (tiap 2 menit saat ada interaksi)
      if (now - lastTouchRef.current > TOUCH_INTERVAL_MS) {
        lastTouchRef.current = now;
        fetch('/api/auth/touch', { method: 'POST' }).catch(() => {});
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Interval cek inaktivitas tiap 10 detik
    const intervalId = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActiveRef.current;

      if (idleTime >= ONE_HOUR_MS) {
        // Idle selama 1 jam penuh tanpa interaksi -> Auto logout
        clearInterval(intervalId);
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
          router.push('/login?reason=idle_timeout');
        });
      }
    }, 10000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [pathname, router]);

  return null;
}
