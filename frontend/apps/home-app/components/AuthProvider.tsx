'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const stored = localStorage.getItem('auth-storage');

    if (!stored || user) return;

    try {
      const parsed = JSON.parse(stored);
      const storedUser = parsed.state?.user;

      if (storedUser) {
        setAuth(storedUser);
      }
    } catch (error) {
      console.error('Auth hydrate error:', error);
    }
  }, [user, setAuth]);

  return <>{children}</>;
}