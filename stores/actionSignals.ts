import { create } from 'zustand';
import { useEffect, useRef } from 'react';

export interface ActionSignal<T = any> {
  id: string; // Identificador único (nonce) generado en cada invocación: `${type}_${Date.now()}_${Math.random()}`
  type: string; // Tipo de función o acción (ej: 'HIGHLIGHT_CRM_DEAL', 'FLASH_ROW', 'FOCUS_INPUT')
  payload: T; // Datos requeridos para la ejecución efímera
  timestamp: number;
}

interface ActionSignalStore {
  signals: Record<string, ActionSignal>;
  dispatchSignal: <T = any>(type: string, payload: T) => string;
  consumeSignal: (type: string, id: string) => void;
  clearAllSignals: () => void;
}

/**
 * Store de Señales de Acción Efímeras.
 * Totalmente desacoplado del estado persistente (datos de negocio / sesión / borradores).
 * Garantiza que cada clic o ejecución de una función vuelva a activarse al 100%,
 * sin ser bloqueado por memoizaciones, URLs residuales ni persistencias de storage.
 */
export const useActionSignalsStore = create<ActionSignalStore>((set) => ({
  signals: {},

  dispatchSignal: <T = any>(type: string, payload: T) => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const signal: ActionSignal<T> = {
      id,
      type,
      payload,
      timestamp: Date.now(),
    };

    set((state) => ({
      signals: {
        ...state.signals,
        [type]: signal,
      },
    }));

    return id;
  },

  consumeSignal: (type: string, id: string) => {
    set((state) => {
      const current = state.signals[type];
      if (current && current.id === id) {
        const next = { ...state.signals };
        delete next[type];
        return { signals: next };
      }
      return state;
    });
  },

  clearAllSignals: () => set({ signals: {} }),
}));

/**
 * Despachador global de funciones/señales.
 * Se puede invocar desde cualquier parte de la aplicación sin necesidad de hooks.
 * 
 * @example
 * dispatchActionSignal('HIGHLIGHT_CRM_DEAL', { dealId: 'D-101' });
 */
export const dispatchActionSignal = <T = any>(type: string, payload: T): string => {
  return useActionSignalsStore.getState().dispatchSignal(type, payload);
};

/**
 * Hook para escuchar y reaccionar a una señal de acción efímera en un componente.
 * Cada vez que se emite la señal (así se haga 1.000 veces seguidas con el mismo payload),
 * el callback se vuelve a ejecutar garantizado de forma instantánea.
 * 
 * @param type Tipo de señal a escuchar
 * @param onTrigger Función callback a ejecutar con el payload de la acción
 */
export function useActionSignal<T = any>(
  type: string,
  onTrigger: (payload: T, signal: ActionSignal<T>) => void
) {
  const signal = useActionSignalsStore((s) => s.signals[type] as ActionSignal<T> | undefined);
  const consumeSignal = useActionSignalsStore((s) => s.consumeSignal);
  const lastProcessedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!signal) return;
    if (signal.id !== lastProcessedIdRef.current) {
      lastProcessedIdRef.current = signal.id;
      onTrigger(signal.payload, signal);
      // Consumir la señal para liberar el bus sin bloquear futuras llamadas
      consumeSignal(type, signal.id);
    }
  }, [signal, type, onTrigger, consumeSignal]);
}
