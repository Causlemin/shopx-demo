import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  setAuth: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      setAuth: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;

          if (state.user) {
            state.isAuthenticated = true;
          }
        }
      },
    }
  )
);