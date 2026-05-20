'use client';

import { formatCurrency } from '@/constants';
import { orderApi } from '@repo/api-client';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { CheckCircle, Mail, Package, Phone } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

interface OrderConfirmation {
  orderId?: string;
  id?: string;
  orderNumber?: string;
  trackingNumber?: string;
  totalPrice: number;
  email?: string;
  customerEmail?: string;
  estimatedDelivery?: string;
}

function OrderConfirmationContent() {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      const response = await orderApi.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Sipariş detayları alınamadı:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">
            Sipariş detayları yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!order || !orderId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">❌ Sipariş Bulunamadı</h1>
        <p className="mt-2 text-muted-foreground">
          Geçersiz sipariş numarası.
        </p>
        <Button className="mt-4" onClick={() => push('/')}>
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  const displayOrderNumber =
    order.trackingNumber ||
    order.orderNumber ||
    `#${orderId.slice(-6)}`;

  const customerEmail = order.customerEmail || order.email;

  const estimatedDelivery =
    order.estimatedDelivery ||
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString();

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
                <span className="font-mono text-sm">{displayOrderNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Toplam Tutar:</span>
                <span className="text-lg font-bold">
                  ₺{formatCurrency(order.totalPrice)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Tahmini Teslimat:</span>
                <span>{estimatedDelivery}</span>
              </div>
            </div>
          </div>

          {customerEmail && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-blue-800">E-posta Bilgisi</p>
                  <p className="text-sm text-blue-600">
                    Sipariş bilgileri <strong>{customerEmail}</strong> adresiyle ilişkilendirildi.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-800">Müşteri Hizmetleri</p>
                <p className="text-sm text-green-600">
                  Sorularınız için 0850 123 45 67 numaralı telefondan bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              window.location.href = 'http://localhost:3000';
            }}
          >
            Ana Sayfaya Git
          </Button>
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

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Yükleniyor...
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}