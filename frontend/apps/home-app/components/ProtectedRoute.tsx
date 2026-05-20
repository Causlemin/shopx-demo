'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || !user) {
      toast.error('Giriş Gerekli', {
        description: 'Bu sayfayı görüntülemek için giriş yapmalısınız.',
      });

      router.push('/login');
      setIsChecking(false);
      return;
    }

    const isAdmin = user.roles?.includes('Admin');

    if (adminOnly && !isAdmin) {
      toast.error('Erişim Engellendi', {
        description: 'Bu sayfaya erişmek için admin yetkiniz yok.',
      });

      router.push('/');
      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [adminOnly, isAuthenticated, router, user]);

  if (!hasHydrated || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  if (adminOnly && !user.roles?.includes('Admin')) return null;

  return <>{children}</>;
}