'use client';

import { useEffect } from 'react';
import { authApi } from '@repo/api-client';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const user = await authApi.me();
        setAuth(user);
      } catch {
        clearAuth();
      }
    };

    bootstrapAuth();
  }, [setAuth, clearAuth]);

  return <>{children}</>;
}