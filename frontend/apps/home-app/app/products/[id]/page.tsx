'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@repo/ui';
import { productApi, orderApi, cartApi } from "@repo/api-client";
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { emitCartAdd, emitCartSync } from '@repo/event-bus';
import { formatCurrency } from '@/constants';
import { ChevronLeft, MinusCircleIcon, PlusCircleIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const items = useCartStore((state) => state.items);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const cartItem = items.find((item) => item.id === params.id);
  const displayQuantity = cartItem?.quantity ?? selectedQuantity;

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await productApi.getById(params.id as string);
      setProduct(response.data);
    } catch (error) {
      console.error('Ürün yüklenirken hata oluştu:', error);
      toast.error('Hata!', {
        description: 'Ürün bilgileri yüklenirken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await orderApi.create({ productId: product.id, quantity });
      toast.success('Sipariş oluşturuldu!', {
        description: 'Siparişiniz başarıyla oluşturuldu.'
      });
      router.push('/orders');
    } catch (error) {
      toast.error('Hata!', {
        description: 'Sipariş oluşturulurken bir hata oluştu'
      });
    }
  };

  const handleAddToCart = async () => {
      setIsLoading(true);
  
      const item = {
        id: product?.id!,
        name: product?.name!,
        price: product?.price!,
        quantity: selectedQuantity,
        imageUrl: product?.imageUrl!,
      };
  
      addItem(item);
  
      try {
        await emitCartAdd(item);
        await cartApi.sync(useCartStore.getState().items);
        await emitCartSync(
          useCartStore.getState().items
        );
  
        toast.success('Sepete eklendi', {
          description: `${product?.name} sepetinize eklendi.`,
        });
      } catch (error) {
        toast.error('Sepet senkronize edilemedi', {
          description: 'Ürün lokal sepete eklendi ancak Cart App güncellenemedi.',
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleDecrease = async () => {
      if (cartItem) {
        const nextQuantity = cartItem.quantity - 1;
  
        if (nextQuantity <= 0) {
          removeItem(product?.id!);
          setSelectedQuantity(1);
        } else {
          updateQuantity(product?.id!, nextQuantity);
          setSelectedQuantity(nextQuantity);
        }
  
        await cartApi.sync(useCartStore.getState().items);
        await emitCartSync(useCartStore.getState().items);
        return;
      }
  
      setSelectedQuantity((q) => Math.max(1, q - 1));
    };
  
    const handleIncrease = async () => {
  
      if (cartItem) {
        const nextQuantity = cartItem.quantity + 1;
  
        if (nextQuantity > product?.stock!) return;
  
        updateQuantity(product?.id!, nextQuantity);
        setSelectedQuantity(nextQuantity);
        await cartApi.sync(useCartStore.getState().items);
        await emitCartSync(useCartStore.getState().items);
        return;
      }
  
      setSelectedQuantity((q) => Math.min(product?.stock!, q + 1));
    };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>;
  if (!product) return <div className="flex min-h-screen items-center justify-center">Ürün bulunamadı</div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ChevronLeft className="mr-2" />
        Geri
      </Button>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-gray-100">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-lg object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Resim yok</div>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.category}</p>
          <p className="mt-4 text-gray-600">{product.description}</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">₺{formatCurrency(product.price)}</span>
          </div>
          <p className={`mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `Stokta var (${product.stock})` : 'Stokta yok'}
          </p>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
              variant="outline" 
              size="icon" 
              disabled={!cartItem && selectedQuantity <= 1}
              onClick={handleDecrease}>
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
              variant="outline" 
              size="icon"
              disabled={displayQuantity >= product.stock}
              onClick={handleIncrease}>
                <PlusCircleIcon />
              </Button>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <Button onClick={handleAddToCart} disabled={product.stock === 0}
            className='min-w-50'
            >
              Sepete Ekle 🛒
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}