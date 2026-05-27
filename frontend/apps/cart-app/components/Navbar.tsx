'use client';

import { cartPath } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cartApi } from '@repo/api-client';
import { emitCartSync, subscribeCartSync } from '@repo/event-bus';
import { Button } from '@repo/ui';
import { ChevronLeftIcon, ShoppingCartIcon, Trash2, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { getTotalCount, clearCart, setItems } = useCartStore();
  const { user } = useAuthStore();

  // Sipariş onay sayfasında navbar'ı gizle
  const isConfirmationPage = useMemo(() => pathname === '/order-confirmation' || pathname === '/cart/order-confirmation',[pathname]);
  const isPaymentPage = useMemo(() => pathname === '/checkout' || pathname === '/cart/checkout',[pathname]);

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

  const handleClearCart = async () => {
    if (getTotalCount() === 0) {
      return;
    }
    clearCart();
    await cartApi.clear();
    await emitCartSync([]);
  };

  if (isConfirmationPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={!isPaymentPage ? "http://localhost:3000/" : cartPath("/") } className="flex items-center gap-2 text-lg font-bold">
          <ChevronLeftIcon /> 
          <h1 className='hidden md:block'>{!isPaymentPage ? "Alışverişe Devam Et" : "Geri"}</h1>
        </Link>

        <div className="text-xl font-bold flex items-center gap-2">
          <ShoppingCartIcon className='w-5 h-5'/>
          <h1 className='hidden md:block'>Sepetim</h1>
        </div>

        <div className='flex items-center gap-4'>
          <Button variant="outline" onClick={handleClearCart} className='cursor-pointer'>
            <Trash2 className="mr-1 h-4 w-4" /> 
            <h1 className='hidden md:block'>Temizle</h1>
          </Button>
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm capitalize">{user?.username || 'Misafir'}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}