'use client';

import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { cartApi, productApi } from '@repo/api-client';
import { subscribeOrderCompleted } from '@repo/event-bus';
import { ShoppingBagIcon, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const setItems = useCartStore((state) => state.setItems);
  const syncWithCartApp = useCartStore((state) => state.syncWithCartApp);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, []);

  const hydrateCart = useCallback(async () => {
    try {
      const response = await cartApi.get();
      setItems(response.data);
    } catch (error) {
      console.error('Cart snapshot hydrate failed:', error);
    }
  }, [setItems]);

  useEffect(() => {
    let unsubscribeOrderCompleted: (() => void) | undefined;

    const setup = async () => {
      try {
        syncWithCartApp();

        await Promise.all([
          fetchProducts(),
          hydrateCart(),
        ]);

        unsubscribeOrderCompleted = await subscribeOrderCompleted(() => {
          fetchProducts();
        });
      } finally {
        setLoading(false);
      }
    };

    setup();

    return () => {
      unsubscribeOrderCompleted?.();
    };
  }, [fetchProducts, hydrateCart, syncWithCartApp]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Ürünler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className='space-y-2'>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingBagIcon /> 
              Ürünlerimiz
            </h1>
            <p className="text-muted-foreground">
              Harika ürünleri uygun fiyatlarla keşfedin
            </p>
          </div>

          <a
            href="/cart"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sepete git
            <ShoppingCart className='w-4 h-4'/>
          </a>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}