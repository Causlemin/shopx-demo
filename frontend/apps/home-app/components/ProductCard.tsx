'use client';

import { useEffect, useState } from 'react';
import { Button } from '@repo/ui';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { formatCurrency } from '@/constants';
import { emitCartAdd } from "@repo/event-bus";
import { cartApi } from '@repo/api-client';
import { MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import { emitCartSync } from '@repo/event-bus';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const {push} = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const items = useCartStore((state) => state.items);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const cartItem = items.find((item) => item.id === product.id);
  const displayQuantity = cartItem?.quantity ?? selectedQuantity;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: selectedQuantity,
      imageUrl: product.imageUrl,
    };

    addItem(item);

    try {
      await emitCartAdd(item);
      await cartApi.sync(useCartStore.getState().items);
      await emitCartSync(
        useCartStore.getState().items
      );

      toast.success('Sepete eklendi', {
        description: `${product.name} sepetinize eklendi.`,
      });
    } catch (error) {
      toast.error('Sepet senkronize edilemedi', {
        description: 'Ürün lokal sepete eklendi ancak Cart App güncellenemedi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartItem) {
      const nextQuantity = cartItem.quantity - 1;

      if (nextQuantity <= 0) {
        removeItem(product.id);
        setSelectedQuantity(1);
      } else {
        updateQuantity(product.id, nextQuantity);
        setSelectedQuantity(nextQuantity);
      }

      await cartApi.sync(useCartStore.getState().items);
      await emitCartSync(useCartStore.getState().items);
      return;
    }

    setSelectedQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartItem) {
      const nextQuantity = cartItem.quantity + 1;

      if (nextQuantity > product.stock) return;

      updateQuantity(product.id, nextQuantity);
      setSelectedQuantity(nextQuantity);
      await cartApi.sync(useCartStore.getState().items);
      await emitCartSync(useCartStore.getState().items);
      return;
    }

    setSelectedQuantity((q) => Math.min(product.stock, q + 1));
  };

  useEffect(() => {
    if (cartItem) {
      setSelectedQuantity(cartItem.quantity);
      return;
    }

    setSelectedQuantity(1);
  }, [cartItem?.quantity]);

  return (
    <div
      onClick={() => push(`/products/${product.id}`)}
      className='cursor-pointer'
    >
      <Card className="w-full md:max-w-sm transition-all shadow-md hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <div className="text-sm text-muted-foreground">{product.category}</div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold">₺{formatCurrency(product.price)}</span>
            <span className="text-sm text-green-600">
              {product.stock > 0 ? `Stokta (${product.stock})` : 'Stokta yok'}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="flex w-full items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              disabled={!cartItem && selectedQuantity <= 1}
              onClick={handleDecrease}
            >
              <MinusCircleIcon />
            </Button>

            <div className="flex flex-1 flex-col items-center">
              <span className="font-semibold">
                {displayQuantity}
              </span>

              <span className="text-xs text-muted-foreground">
                {cartItem ? 'Sepette' : 'Eklenecek adet'}
              </span>
            </div>

            <Button
              size="icon"
              variant="outline"
              disabled={displayQuantity >= product.stock}
              onClick={handleIncrease}
            >
              <PlusCircleIcon />
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className="w-full"
          >
            {cartItem
              ? 'Sepete Ekle / Arttır 🛒'
              : isLoading
                ? 'Ekleniyor...'
                : 'Sepete Ekle 🛒'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}