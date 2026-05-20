'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@repo/ui';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { subscribeCartSync } from "@repo/event-bus";
import { ShoppingCart, User, Package, LayoutDashboard, LogOut, LogIn, ShoppingBagIcon, HomeIcon, MenuIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { authApi } from '@repo/api-client';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui"
import MenuMd from './MenuMd';
import NavbarCart from './NavbarCart';

export function Navbar() {
  const { push } = useRouter();
  const pathname = usePathname();
  const setItems = useCartStore((state) => state.setItems);
  const items = useCartStore((state) => state.items);
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const isAdmin = user?.roles?.includes('Admin');
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    subscribeCartSync((items) => {
      setItems(items);
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      unsubscribe?.();
    };
  }, [setItems]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    clearAuth();

    toast.success('Çıkış yapıldı', {
      description: 'Güle güle! Yine bekleriz.',
    });

    push('/');
  };

  // Login olmamış kullanıcı için basit navbar
  if (!isAuthenticated) {
    return (
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="flex items-center gap-2">
            <ShoppingBagIcon />
            <Link href="/" className="text-xl font-bold">
              ShopX
            </Link>
          </span>

          <div className="flex items-center gap-4">
            <Button variant="default" size="sm" onClick={() => push('/login')}>
              <LogIn className="mr-1 h-4 w-4" /> Giriş Yap
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  // Login olmuş kullanıcı için tam navbar
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          ShopX
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Button variant={isActive('/') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => push("/")}
          >
            <HomeIcon className="mr-1 h-4 w-4" />
            Ana Sayfa
          </Button>

          {isAdmin && (
            <Button
              variant={(isActive('/admin/products') || isActive("/admin/logs")) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => push("/admin/products")}
            >
              <LayoutDashboard className="mr-1 h-4 w-4" /> Yönetim
            </Button>
          )}

          <Button
            variant={isActive('/orders') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => push("/orders")}
          >
            <Package className="mr-1 h-4 w-4" /> Siparişlerim
          </Button>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm capitalize">{user?.username || 'Misafir'}</span>
          </div>
        </div>

        <div className='flex items-center gap-4 pr-4'>
          <NavbarCart items={items}/>

          <Button variant="ghost" size="sm" onClick={handleLogout}
          className='hidden md:flex'
          >
            <LogOut className="mr-1 h-4 w-4" /> Çıkış
          </Button>
          <MenuMd roles={user?.roles!} name={user?.username ?? "Misafir"} />
        </div>
      </div>
    </nav>
  );
}