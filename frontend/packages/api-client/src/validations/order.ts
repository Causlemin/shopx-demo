import { z } from 'zod';

export const createOrderSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;