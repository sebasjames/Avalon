import React from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingTaskNote: React.FC = () => {
    const { floatingNote, setFloatingNote, resolveNotification } = useEnterprise();

    return (
        <AnimatePresence>
            {floatingNote && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-6 left-6 w-80 bg-yellow-100 border border-yellow-300 shadow-2xl rounded-xl overflow-hidden z-[9999]"
                    style={{ 
                        boxShadow: '4px 8px 24px rgba(251, 191, 36, 0.2), 0 0 0 1px rgba(251, 191, 36, 0.4)'
                    }}
                >
                    <div className="bg-yellow-200 px-4 py-2 flex items-center justify-between border-b border-yellow-300">
                        <span className="text-xs font-black uppercase text-yellow-800 tracking-wider">Nota de Tarea</span>
                        <button 
                            onClick={() => setFloatingNote(null)}
                            className="text-yellow-700 hover:text-yellow-900 bg-yellow-300/50 hover:bg-yellow-300 p-1 rounded-full transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-yellow-900 mb-2">{floatingNote.title}</h4>
                        <p className="text-sm text-yellow-800 leading-relaxed bg-yellow-50 p-2 rounded border border-yellow-200 mb-4 shadow-inner">
                            {floatingNote.message}
                        </p>
                        
                        <button 
                            onClick={() => {
                                resolveNotification(floatingNote.id, 'resolved');
                                setFloatingNote(null);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-sm shadow-md transition-colors"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Marcar como resuelto
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
