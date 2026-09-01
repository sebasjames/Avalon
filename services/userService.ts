import { SystemUser } from '../types';

const USERS_STORAGE_KEY = 'avalon_system_users_v1';

export const DEFAULT_USERS: SystemUser[] = [
    { id: '1', name: 'Admin Global', email: 'admin@avalon.com', baseRole: 'admin', customPermissions: {} as any, quota: 500000000 },
    { id: '2', name: 'Contabilidad Jefatura', email: 'conta@avalon.com', baseRole: 'Contabilidad', customPermissions: {} as any },
    { id: '3', name: 'Ana García', email: 'ana@avalon.com', baseRole: 'Comercial', customPermissions: {} as any, quota: 150000000, region: 'Norte', avatar: 'AG', phone: '+52 55 1234 5678' },
    { id: '4', name: 'Carlos Méndez', email: 'carlos@avalon.com', baseRole: 'Comercial', customPermissions: {} as any, quota: 100000000, region: 'Sur', avatar: 'CM', phone: '+52 55 8765 4321' },
    { id: '5', name: 'Lucía Fernández', email: 'lucia@avalon.com', baseRole: 'manager', customPermissions: {} as any, quota: 200000000, region: 'Global', avatar: 'LF', phone: '+52 55 1122 3344' },
    { id: '6', name: 'Punto de Venta 1', email: 'pos1@avalon.com', baseRole: 'POS', customPermissions: {} as any },
    { id: '7', name: 'Bodega Principal', email: 'bodega@avalon.com', baseRole: 'Despachos', customPermissions: {} as any },
];

/**
 * Repository Adapter Layer for System Users & Permissions.
 * Facilitates seamless migration from LocalStorage to REST API / GraphQL / Supabase in Production.
 */
export const userService = {
    /**
     * Load initial users from persistence layer
     */
    getInitialUsers: (): SystemUser[] => {
        try {
            const stored = localStorage.getItem(USERS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Error reading system users from localStorage', e);
        }
        return DEFAULT_USERS;
    },

    /**
     * Persist complete users array
     */
    saveUsers: (users: SystemUser[]): void => {
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {
            console.error('Error saving system users to localStorage', e);
        }
    }
};
