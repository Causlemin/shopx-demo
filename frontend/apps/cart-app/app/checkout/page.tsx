'use client';

import { cartPath, formatCurrency } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { cartApi, orderApi } from '@repo/api-client';
import { CheckoutFormData, checkoutSchema } from '@repo/api-client/validations';
import { emitCartSync } from '@repo/event-bus';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@repo/ui';
import { CreditCard, Loader2, Lock, PhoneIcon, PinIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const totalPrice = getTotalPrice();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.username || '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      city: '',
      district: '',
      address: '',
      zipCode: '',
      notes: '',
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    },
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Sepet Boş', {
        description: 'Sepetinizde ürün bulunmamaktadır.',
      });
      router.push('http://localhost:3000');
      return;
    }

    setIsLoading(true);

    toast.message('Ödeme İşleniyor', {
      description: 'Kart bilgileriniz kontrol ediliyor...',
      duration: 2000,
      descriptionClassName: 'text-muted-foreground',
    });

    setIsProcessingPayment(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Ödeme Başarılı!', {
      description: 'Kartınızdan ₺' + formatCurrency(totalPrice) + ' tahsil edildi.',
      descriptionClassName: 'text-muted-foreground',
    });

    try {
      const payload = {
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),

        totalPrice,

        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,

        city: data.city,
        district: data.district,
        address: data.address,
        zipCode: data.zipCode || '',

        notes: data.notes || '',

        paymentMethod: 'credit_card',
        cardNumber: data.cardNumber,
        cardName: data.cardName,
        expiryDate: data.expiryDate,
      };

      const response = isAuthenticated
        ? await orderApi.create(payload)
        : await orderApi.createGuest(payload);

      if (response.status === 200 || response.status === 201) {
        const result = response.data;
        toast.success('Siparişiniz Alındı!', {
          description: `Sipariş takip numaranız: ${result.trackingNumber || result.orderNumber}`,
        });

        clearCart();
        await cartApi.clear();
        await emitCartSync([]);
        router.replace(cartPath(`/order-confirmation?orderId=${result.orderId}`));
      } else {
        throw new Error('Sipariş oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Sipariş hatası:', error);
      toast.error('Sipariş Oluşturulamadı', {
        description: error.response?.data?.message || error.message || 'Bir hata oluştu, lütfen tekrar deneyin.',
      });
    } finally {
      setIsLoading(false);
      setIsProcessingPayment(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">🛒 Sepetiniz Boş</h1>
        <p className="mt-2 text-muted-foreground">Alışverişe başlamak için ürün ekleyin.</p>
        <a
          href="http://localhost:3000"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Alışverişe Başla →
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Sipariş ve Ödeme</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Sol Taraf - İletişim ve Adres Formu */}
          <div className="space-y-6">
            <Card className='shadow-md'>
              <CardHeader>
                <CardTitle className='font-bold flex items-center gap-2'>
                  <PhoneIcon className='w-5 h-5'/>
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className='space-y-1'>
                    <Label className='text-sm' htmlFor="firstName">Ad *</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-sm' htmlFor="lastName">Soyad *</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label className='text-sm' htmlFor="email">E-posta *</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sipariş onayı ve takip bilgileri bu adrese gönderilecektir.
                  </p>
                </div>

                <div className='space-y-1'>
                  <Label className='text-sm' htmlFor="phone">Telefon *</Label>
                  <Input id="phone" placeholder="05XX XXX XX XX" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className='shadow-md'>
              <CardHeader>
                <CardTitle className='font-bold flex items-center gap-2'>
                  <PinIcon className='w-5 h-5'/>
                  Teslimat Adresi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className='space-y-1'>
                    <Label className='text-sm' htmlFor="city">İl *</Label>
                    <Input id="city" {...register('city')} />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city.message}</p>
                    )}
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-sm' htmlFor="district">İlçe *</Label>
                    <Input id="district" {...register('district')} />
                    {errors.district && (
                      <p className="text-sm text-red-500">{errors.district.message}</p>
                    )}
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label className='text-sm' htmlFor="address">Açık Adres *</Label>
                  <Input id="address" placeholder="Mahalle, Sokak, No, Daire..." {...register('address')} />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className='space-y-1'>
                  <Label className='text-sm' htmlFor="zipCode">Posta Kodu</Label>
                  <Input id="zipCode" {...register('zipCode')} />
                </div>

                <div className='space-y-1'>
                  <Label className='text-sm' htmlFor="notes">Sipariş Notu (isteğe bağlı)</Label>
                  <Input id="notes" placeholder="Kapı notu, teslimat talimatları..." {...register('notes')} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Taraf - Ödeme ve Sipariş Özeti */}
          <div className="space-y-6">
            <Card className='shadow-md'>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-bold">
                  <CreditCard className="h-5 w-5" />
                  Ödeme Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className='space-y-1'>
                  <Label className='text-sm' htmlFor="cardNumber">Kart Numarası *</Label>
                  <Input
                    id="cardNumber"
                    placeholder="**** **** **** ****"
                    {...register('cardNumber')}
                    onChange={(e) => {
                      e.target.value = formatCardNumber(e.target.value);
                      register('cardNumber').onChange(e);
                    }}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-red-500">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className='space-y-1'>
                  <Label className='text-sm' htmlFor="cardName">Kart Üzerindeki İsim *</Label>
                  <Input id="cardName" placeholder="Alper Kale" {...register('cardName')} />
                  {errors.cardName && (
                    <p className="text-sm text-red-500">{errors.cardName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className='space-y-1'>
                    <Label className='text-sm' htmlFor="expiryDate">Son Kullanma Tarihi *</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      {...register('expiryDate')}
                      onChange={(e) => {
                        e.target.value = formatExpiryDate(e.target.value);
                        register('expiryDate').onChange(e);
                      }}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
                    )}
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-sm' htmlFor="cvv">CVV *</Label>
                    <Input id="cvv" type="password" placeholder="***" {...register('cvv')} />
                    {errors.cvv && (
                      <p className="text-sm text-red-500">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  <Lock className="h-4 w-4" />
                  <span>Ödeme işlemleriniz 256-bit SSL ile güvence altındadır.</span>
                </div>
              </CardContent>
            </Card>

            <Card className='shadow-md'>
              <CardHeader>
                <CardTitle className='font-bold'>Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 space-y-2 overflow-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₺{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Toplam</span>
                    <span className="text-xl">₺{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isProcessingPayment}
                >
                  {isLoading || isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isProcessingPayment ? 'Ödeme İşleniyor...' : 'Sipariş Oluşturuluyor...'}
                    </>
                  ) : (
                    `Ödemeyi Tamamla (₺${formatCurrency(totalPrice)})`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}