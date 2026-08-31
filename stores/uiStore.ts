import { create } from 'zustand';
import { ToastAlert, FloatingNote } from '../types';

interface UIState {
    toasts: ToastAlert[];
    floatingNote: FloatingNote | null;
    
    addToast: (toast: Omit<ToastAlert, 'id'>) => void;
    removeToast: (id: string) => void;
    setFloatingNote: (note: FloatingNote | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    toasts: [],
    floatingNote: null,
    
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }]
        }));
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
        }));
    },
    setFloatingNote: (note) => set({ floatingNote: note }),
}));
