import { create } from 'zustand';

export type UserRole = 'admin' | 'manager' | 'Comercial' | 'Contabilidad' | 'POS' | 'Despachos';

interface AuthState {
    activeRole: UserRole;
    activeUserId: string;
    setActiveRole: (role: UserRole) => void;
    setActiveUserId: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    activeRole: 'admin',
    activeUserId: '1',
    setActiveRole: (role) => set({ activeRole: role }),
    setActiveUserId: (id) => set({ activeUserId: id }),
}));
