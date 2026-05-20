'use client';

import { formatCurrency } from '@/constants';
import { orderApi } from '@repo/api-client';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { CheckCircle, Mail, Package, Phone } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface OrderConfirmation {
  orderId: string;
  trackingNumber: string;
  totalPrice: number;
  customerEmail: string;
  estimatedDelivery: string;
}

export default function OrderConfirmationPage() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await orderApi.getById(orderId as string);
      setOrder(response.data);
    } catch (error) {
      console.error('Sipariş detayları alınamadı:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, setOrder]);

  useEffect(() => {
    if(!orderId) {
      setLoading(false);
      return;
    }
    fetchOrderDetails();
  }, [orderId, fetchOrderDetails]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Sipariş detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">❌ Sipariş Bulunamadı</h1>
        <p className="mt-2 text-muted-foreground">Geçersiz sipariş numarası.</p>
        <Button className="mt-4" onClick={() => push('/')}>
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Siparişiniz Alındı!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Siparişiniz başarıyla oluşturuldu. En kısa sürede işleme alınacaktır.
          </p>

          <div className="rounded-lg bg-muted p-4">
            <div className="grid gap-3 text-left">
              <div className="flex justify-between">
                <span className="font-medium">Sipariş No:</span>
                <span className="font-mono text-sm">#{orderId?.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Toplam Tutar:</span>
                <span className="font-bold text-lg">₺{formatCurrency(order?.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tahmini Teslimat:</span>
                <span>{order?.estimatedDelivery ?? new Date(Date.now() + 2 *24*60*60*1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <p className="font-medium text-blue-800">E-posta Gönderildi</p>
                <p className="text-sm text-blue-600">
                  Sipariş onayı ve takip bilgileri <strong>{order?.customerEmail}</strong> adresinize gönderildi.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-left">
                <p className="font-medium text-green-800">Müşteri Hizmetleri</p>
                <p className="text-sm text-green-600">
                  Sorularınız için 0850 123 45 67 numaralı telefondan bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => window.location.href = 'http://localhost:3000'}>
              Ana Sayfaya Git
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>Sipariş durumunuzu e-posta ile takip edebilirsiniz.</span>
        </div>
      </div>
    </div>
  );
}