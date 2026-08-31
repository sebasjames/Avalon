import { useEffect } from 'react';

/**
 * Global hook to close modals/panels with the Escape key.
 * @param callback Function to call when Escape is pressed
 * @param condition Boolean condition, hook only active when true
 */
export function useEscapeKey(callback: () => void, condition: boolean = true) {
  useEffect(() => {
    if (!condition) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback, condition]);
}
