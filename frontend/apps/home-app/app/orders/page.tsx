'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatCurrency } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import { authApi, orderApi } from "@repo/api-client";
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Order {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { clearAuth } = useAuthStore();

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await orderApi.getMyOrders();

      setOrders(response.data);
    } catch (error: any) {
      console.error('Siparişler yüklenirken hata oluştu:', error);

      if (error.response?.status === 401) {
        clearAuth();
        await authApi.logout();
        router.push('/login');
        return;
      }

      toast.error('Hata!', {
        description: 'Siparişleriniz yüklenirken bir hata oluştu',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'text-green-600';
      case 'Pending': return 'text-yellow-600';
      case 'Cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'Onaylandı';
      case 'Pending': return 'Beklemede';
      case 'Cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Siparişlerim</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Henüz hiç sipariş vermediniz.</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              Alışverişe Başla
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className='shadow-md'>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sipariş #{order.id.slice(0, 8)}</span>
                  <span className={`text-sm font-normal ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status === "Completed" ? "Tamamlandı" : "Beklemede")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{order.productName}</p>
                    <p className="text-sm text-muted-foreground">Adet: {order.quantity}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">₺{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}