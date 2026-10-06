import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'manager' | 'Comercial' | 'Contabilidad' | 'POS' | 'Despachos';

interface AuthState {
    activeRole: UserRole;
    activeUserId: string;
    setActiveRole: (role: UserRole) => void;
    setActiveUserId: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            activeRole: 'admin',
            activeUserId: '1',
            setActiveRole: (role) => set({ activeRole: role }),
            setActiveUserId: (id) => set({ activeUserId: id }),
        }),
        {
            name: 'avalon-auth-storage', // name of the item in the storage (must be unique)
        }
    )
);
