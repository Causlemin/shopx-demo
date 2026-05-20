import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name required').max(100),
  description: z.string().min(1).max(500),
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  stock: z.string().min(1, 'Stock is required').regex(/^\d+$/, 'Invalid stock format'),
  category: z.string().min(1),
  imageUrl: z.string().optional().nullable()
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  category: z.string().min(1).optional(),
  imageUrl: z.url().optional(),
});

export const updateStockSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

export type ProductFormData = z.infer<typeof createProductSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;