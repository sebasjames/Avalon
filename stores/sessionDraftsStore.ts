import { create } from 'zustand';

interface DraftEntry<T = any> {
  data: T;
  lastUpdated: number;
}

interface SessionDraftsStore {
  drafts: Record<string, DraftEntry>;
  
  // Guardar borrador en memoria y opcionalmente en localStorage
  setDraft: <T = any>(key: string, data: T, persistToStorage?: boolean) => void;
  
  // Obtener borrador
  getDraft: <T = any>(key: string, defaultValue?: T) => T | undefined;
  
  // Limpiar borrador cuando la entidad o formulario se guarda exitosamente
  clearDraft: (key: string) => void;
  
  // Limpiar todos los borradores de sesión
  clearAllDrafts: () => void;
}

const STORAGE_PREFIX = 'AVALON_DRAFT_';

/**
 * Store para datos de trabajo y borradores en progreso del humano.
 * Solo guarda lo que se está agregando, editando o redactando para no perder trabajo
 * al cambiar de vista o recargar la pantalla.
 * Está 100% separado de las funciones y disparadores de acciones.
 */
export const useSessionDraftsStore = create<SessionDraftsStore>((set, get) => ({
  drafts: {},

  setDraft: <T = any>(key: string, data: T, persistToStorage: boolean = true) => {
    const entry: DraftEntry<T> = {
      data,
      lastUpdated: Date.now(),
    };

    set((state) => ({
      drafts: {
        ...state.drafts,
        [key]: entry,
      },
    }));

    if (persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
      } catch (e) {
        console.warn(`No se pudo persistir el borrador '${key}' en localStorage:`, e);
      }
    }
  },

  getDraft: <T = any>(key: string, defaultValue?: T): T | undefined => {
    const memory = get().drafts[key];
    if (memory) return memory.data as T;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        if (stored) {
          const parsed = JSON.parse(stored) as DraftEntry<T>;
          // Recuperar a memoria
          set((state) => ({
            drafts: {
              ...state.drafts,
              [key]: parsed,
            },
          }));
          return parsed.data;
        }
      } catch (e) {
        console.warn(`Error al recuperar borrador '${key}':`, e);
      }
    }

    return defaultValue;
  },

  clearDraft: (key: string) => {
    set((state) => {
      const next = { ...state.drafts };
      delete next[key];
      return { drafts: next };
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      } catch (e) {
        // ignore
      }
    }
  },

  clearAllDrafts: () => {
    set({ drafts: {} });
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((k) => {
          if (k.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(k);
          }
        });
      } catch (e) {
        // ignore
      }
    }
  },
}));

/**
 * Hook para manejar el borrador de un formulario o entrada de usuario.
 * Garantiza que lo que el usuario está escribiendo se preserve ante recargas o navegaciones,
 * y se borre limpiamente al confirmar o cancelar.
 */
export function useFormDraft<T>(key: string, initialValue: T) {
  const setDraft = useSessionDraftsStore((s) => s.setDraft);
  const getDraft = useSessionDraftsStore((s) => s.getDraft);
  const clearDraft = useSessionDraftsStore((s) => s.clearDraft);

  const savedData = getDraft<T>(key, initialValue) ?? initialValue;

  const updateDraft = (data: T) => {
    setDraft(key, data, true);
  };

  const removeDraft = () => {
    clearDraft(key);
  };

  return {
    draftData: savedData,
    updateDraft,
    removeDraft,
  };
}
