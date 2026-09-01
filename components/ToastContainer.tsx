import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useUIStore();

    return (
        <div className="fixed bottom-5 right-5 z-[10000] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem: React.FC<{ toast: any; onDismiss: () => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 4500);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const getIcon = () => {
        switch (toast.severity) {
            case 'SUCCESS':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
            case 'CRITICAL':
                return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
            case 'WARNING':
                return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            default:
                return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
        }
    };

    const getBorder = () => {
        switch (toast.severity) {
            case 'SUCCESS':
                return 'border-emerald-200 bg-emerald-50/95 text-emerald-950';
            case 'CRITICAL':
                return 'border-rose-200 bg-rose-50/95 text-rose-950';
            case 'WARNING':
                return 'border-amber-200 bg-amber-50/95 text-amber-950';
            default:
                return 'border-blue-200 bg-blue-50/95 text-blue-950';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all ${getBorder()}`}
        >
            {getIcon()}
            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider">{toast.title}</h4>
                <p className="text-sm font-medium mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity p-0.5">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};
