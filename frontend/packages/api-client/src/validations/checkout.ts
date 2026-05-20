import { z } from 'zod';

export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Ad gereklidir').max(50),
  lastName: z.string().min(1, 'Soyad gereklidir').max(50),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz').regex(/^[0-9+\s()-]+$/, 'Geçersiz telefon formatı'),
  city: z.string().min(1, 'İl gereklidir'),
  district: z.string().min(1, 'İlçe gereklidir'),
  address: z.string().min(5, 'Açık adres gereklidir (min 5 karakter)'),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
  cardNumber: z.string().min(16, 'Geçerli kart numarası giriniz').max(19),
  cardName: z.string().min(1, 'Kart üzerindeki isim gereklidir'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Geçerli son kullanma tarihi giriniz (MM/YY)'),
  cvv: z.string().min(3, 'CVV gereklidir').max(4),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;