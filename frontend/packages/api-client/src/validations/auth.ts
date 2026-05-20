import { z } from 'zod';

// Request Schemas (API için)
export const loginRequestSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerRequestSchema = z.object({
  email: z.email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Response Schemas
export const loginResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    username: z.string(),
    roles: z.array(z.string()),
  }).optional(),
  message: z.string().optional(),
});

export const registerResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  userId: z.string().optional(),
});

export const refreshTokenResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  message: z.string().optional(),
});

export const loginSchema = loginRequestSchema;

export const registerSchema = z.object({
  email: z.email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  roles: z.array(z.string()).min(1, 'At least one role is required'), // roles, role değil
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;