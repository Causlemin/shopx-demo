import axios from 'axios';
import * as z from 'zod';
import {
    loginRequestSchema,
    loginResponseSchema,
    refreshTokenResponseSchema,
    registerRequestSchema,
    registerResponseSchema
} from "./validations/auth";
import {
    productIdSchema,
    updateProductSchema,
    updateStockSchema
} from './validations/product';

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5050';

export const api = axios.create({
    baseURL: API_GATEWAY_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

let isRefreshing = false;

let failedQueue: {
    resolve: () => void;
    reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isUnauthorized = error.response?.status === 401;
        const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
        const alreadyRetried = originalRequest?._retry;

        if (!isUnauthorized || isRefreshRequest || alreadyRetried) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: () => resolve(api(originalRequest)),
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            await api.post('/auth/refresh');
            processQueue();

            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// ============ Auth API ============

export const authApi = {
    login: async (emailOrUsername: string, password: string) => {
        const validatedData = loginRequestSchema.parse({ emailOrUsername, password });
        const response = await api.post('/auth/login', validatedData);

        return loginResponseSchema.parse(response.data);
    },

    register: async (email: string, username: string, password: string, roles: string[]) => {
        const validatedData = registerRequestSchema.parse({ email, username, password, roles });
        const response = await api.post('/auth/register', validatedData);

        return registerResponseSchema.parse(response.data);
    },

    refresh: async () => {
        const response = await api.post('/auth/refresh');

        return refreshTokenResponseSchema.parse(response.data);
    },

    me: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async () => {
        return api.post('/auth/logout');
    },
};

// ============ Product API ============

export const productApi = {
    getAll: () => api.get('/products'),

    getById: (id: string) => {
        const { id: validatedId } = productIdSchema.parse({ id });
        return api.get(`/products/${validatedId}`);
    },

    create: async (data: any) => {
        //const validatedData = createProductSchema.parse(data);
        return api.post('/products', data);
    },

    update: async (id: string, data: any) => {
        const { id: validatedId } = productIdSchema.parse({ id });
        const validatedData = updateProductSchema.parse(data);
        return api.put(`/products/${id}`, data);
    },

    delete: async (id: string) => {
        const { id: validatedId } = productIdSchema.parse({ id });
        return api.delete(`/products/${validatedId}`);
    },

    updateStock: async (id: string, quantity: number) => {
        const { id: validatedId } = productIdSchema.parse({ id });
        const validatedData = updateStockSchema.parse({ quantity });
        return api.put(`/products/${validatedId}/stock`, validatedData);
    },
};

// ============ Order API ============

export const orderApi = {
    // Guest order (login olmayan kullanıcı)
    createGuest: async (orderData: any) => {
        return api.post('/orders/guest', orderData);
    },

    // Authenticated order (login olan kullanıcı)
    create: async (orderData: any) => {
        return api.post('/orders', orderData);
    },

    getMyOrders: () => api.get('/orders/my'),

    getById: (id: string) => {
        return api.get(`/orders/${id}`);
    },
};

// ============ Cart API ============

export const cartApi = {
    get: () => api.get('/cart'),

    sync: async (items: any[]) => {
        return api.put('/cart', items);
    },

    clear: async () => {
        return api.delete('/cart');
    },
};

export const logApi = {
  getLatest: (limit = 50) =>
    api.get(`/logs?limit=${limit}`),

  getByService: (service: string, from?: string, to?: string) =>
    api.get(`/logs/service/${service}`, {
      params: { from, to },
    }),

  getByLevel: (level: string, from?: string, to?: string) =>
    api.get(`/logs/level/${level}`, {
      params: { from, to },
    }),

  getByCorrelationId: (correlationId: string) =>
    api.get(`/logs/correlation/${correlationId}`),
};

// ============ Error Handler ============
export const handleApiError = (error: unknown): string => {
    if (error instanceof z.ZodError) {
        // ZodError'da issues array'i var, her biri için message al
        const errorMessages = error.issues.map((err) => {
            const path = err.path.join('.');
            return path ? `${path}: ${err.message}` : err.message;
        });
        return `Validation error: ${errorMessages.join(', ')}`;
    }

    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'Network error';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unknown error occurred';
};