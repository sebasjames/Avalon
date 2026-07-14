import { useEffect } from 'react';

interface PosShortcutsOptions {
    onSearchClient?: () => void;
    onFocusSearch?: () => void;
    onCheckout?: () => void;
    onCancel?: () => void;
    onDeleteLine?: () => void;
    onIncreaseQty?: () => void;
    onDecreaseQty?: () => void;
    onNavigateUp?: () => void;
    onNavigateDown?: () => void;
}

export const usePosShortcuts = (options: PosShortcutsOptions) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // No interceptar si el usuario está escribiendo en un input normal (excepto ESC y function keys)
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

            switch (e.key) {
                case 'F2':
                    e.preventDefault();
                    options.onSearchClient?.();
                    break;
                case 'F7':
                case 'F10':
                    e.preventDefault();
                    options.onFocusSearch?.();
                    break;
                case 'F8':
                    e.preventDefault();
                    options.onCheckout?.();
                    break;
                case 'Escape':
                    // Permitir ESC incluso en inputs para limpiar
                    e.preventDefault();
                    options.onCancel?.();
                    break;
                case 'Delete':
                    if (!isInput) {
                        e.preventDefault();
                        options.onDeleteLine?.();
                    }
                    break;
                case '+':
                    if (!isInput) {
                        e.preventDefault();
                        options.onIncreaseQty?.();
                    }
                    break;
                case '-':
                    if (!isInput) {
                        e.preventDefault();
                        options.onDecreaseQty?.();
                    }
                    break;
                case 'ArrowUp':
                    if (!isInput) {
                        e.preventDefault();
                        options.onNavigateUp?.();
                    }
                    break;
                case 'ArrowDown':
                    if (!isInput) {
                        e.preventDefault();
                        options.onNavigateDown?.();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [options]);
};
