'use client';

import { Button, Card, CardContent } from '@repo/ui';

import { formatCurrency } from '@/constants';
import { CartItem as CartItemType, useCartStore } from '@/store/cartStore';
import { cartApi } from '@repo/api-client';
import { emitCartSync } from '@repo/event-bus';
import { Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export function CartItemComponent({ item }: CartItemProps) {
  const removeItem = useCartStore((state) => state.removeItem);

  const handleRemoveItem = async () => {
    removeItem(item.id);
    await cartApi.sync(useCartStore.getState().items);
    await emitCartSync(
      useCartStore.getState().items
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex-1">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">₺{formatCurrency(item.price)}</p>
        </div>

        <span className="w-12 text-center">{item.quantity}</span>

        <div className="w-24 text-right font-semibold">
          ₺{formatCurrency(item.price * item.quantity)}
        </div>

        <Button
          size="icon"
          variant="destructive"
          onClick={() => handleRemoveItem()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}