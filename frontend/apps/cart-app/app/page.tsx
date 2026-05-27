'use client';

import { useEffect } from 'react';
import { CartItemComponent } from '@/components/CartItem';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@repo/ui';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { subscribeCartAdd, subscribeCartSync, emitCartSync } from "@repo/event-bus";
import { cartPath, formatCurrency } from '@/constants';
import { cartApi } from '@repo/api-client';
import { ChevronLeftIcon, ShoppingCartIcon } from 'lucide-react';

export default function Home() {
  const { push } = useRouter();
  const { items, getTotalCount, getTotalPrice, clearCart, setItems, addItem } = useCartStore();

  useEffect(() => {
    let unsubscribeAdd: (() => void) | undefined;
    let unsubscribeSync: (() => void) | undefined;

    const setup = async () => {
      try {
        // İlk snapshot hidrasyonu
        const response = await cartApi.get();
        setItems(response.data);

        // Canlı listener
        unsubscribeAdd = await subscribeCartAdd((item) => {
          addItem(item);
        });

        // Tam snapshot sync listener (Uygulamalardan biri kapalıysa son snapshotı almalı, yoksa sync olmazlar)
        unsubscribeSync = await subscribeCartSync((items) => {
          setItems(items);
        });
      } catch (error) {
        console.error('Cart setup failed:', error);
      }
    };

    setup();

    return () => {
      unsubscribeAdd?.();
      unsubscribeSync?.();
    };
  }, [addItem, setItems]);

  const handleClearCart = async () => {
    clearCart();
    await cartApi.clear();
    await emitCartSync([]);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCartIcon /> Sepetiniz
        </h1>
        <p className="mt-2 text-muted-foreground">Sepetiniz boş</p>
        <a
          href="http://localhost:3000"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Alışverişe Devam Et
        </a>
      </div>
    );
  }
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 pt-2">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCartIcon /> Sepetiniz
          </h1>
          <Button variant="ghost" onClick={handleClearCart}>
            Tümünü Temizle
          </Button>
        </div>

        <div className="mb-6">
          {items.map((item) => (
            <CartItemComponent key={item.id} item={item} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sipariş Özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Toplam Ürün:</span>
              <span className="font-semibold">{getTotalCount()}</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam Fiyat:</span>
              <span className="text-xl font-bold">₺{formatCurrency(getTotalPrice())}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => push(cartPath('/checkout'))}
            >
              Siparişi Tamamla (₺{formatCurrency(getTotalPrice())})
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <a
            href="http://localhost:3000"
            className="text-sm text-muted-foreground hover:underline flex items-center justify-center gap-2"
          >
            <ChevronLeftIcon /> Alışverişe Devam Et
          </a>
        </div>
      </div>
    </div>
  );
}
