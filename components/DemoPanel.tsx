import React, { useState } from 'react';
import { useDemoStore } from '../stores/demoStore';
import { useEnterprise } from '../context/EnterpriseContext';
import { Beaker, Save, RotateCcw, ShieldAlert, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

export const DemoPanel: React.FC = () => {
    const { isDemoMode, checkpoints, enterDemoMode, exitDemoMode, createCheckpoint, restoreCheckpoint, clearCheckpoints } = useDemoStore();
    const { getCompleteState, restoreCompleteState } = useEnterprise();
    const [checkpointName, setCheckpointName] = useState('');

    const handleToggleDemo = () => {
        if (isDemoMode) {
            const confirmed = window.confirm('¿Estás seguro de salir del Modo Demo? Se perderán todos los cambios no guardados en el entorno real.');
            if (confirmed) {
                const realData = exitDemoMode();
                restoreCompleteState(realData);
                window.alert('Has vuelto al entorno real.');
            }
        } else {
            const confirmed = window.confirm('Estás a punto de entrar al Modo Demo. Se creará un entorno seguro de pruebas.');
            if (confirmed) {
                const currentData = getCompleteState();
                enterDemoMode(currentData);
                window.alert('¡Modo Demo activado!');
            }
        }
    };

    const handleCreateCheckpoint = () => {
        if (!checkpointName.trim()) return;
        createCheckpoint(checkpointName, getCompleteState());
        setCheckpointName('');
        window.alert('Checkpoint guardado correctamente.');
    };

    const handleRestoreCheckpoint = (id: string, name: string) => {
        const confirmed = window.confirm(`¿Seguro que quieres restaurar el checkpoint "${name}"? Se perderá el estado actual del demo.`);
        if (confirmed) {
            const data = restoreCheckpoint(id);
            if (data) {
                restoreCompleteState(data);
                window.alert('Checkpoint restaurado con éxito.');
            }
        }
    };

    const handleResetToReal = () => {
        const confirmed = window.confirm('Esto borrará el demo actual y jalará los datos frescos del entorno real en este momento. ¿Continuar?');
        if (confirmed) {
            // First we need the real data. Wait, if we are in demo mode, getCompleteState is demo data.
            // The real data is in realStateBackup. 
            // But wait, they want *fresh* real data? Since we don't have a backend, the realStateBackup IS the only real data.
            const { realStateBackup } = useDemoStore.getState();
            if (realStateBackup) {
                restoreCompleteState(realStateBackup);
                clearCheckpoints();
                createCheckpoint('Reinicio desde Real', realStateBackup);
                window.alert('Datos reiniciados al estado real.');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Beaker className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Entorno Demo / Sandbox</h2>
                            <p className="text-sm text-slate-400">Área segura para pruebas y simulaciones</p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleToggleDemo}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${isDemoMode ? 'bg-orange-500' : 'bg-slate-600'}`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isDemoMode ? 'translate-x-8' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {!isDemoMode ? (
                        <div className="text-center py-12">
                            <ShieldAlert className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">El Modo Demo está apagado</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">
                                Activa el switch superior para entrar a un entorno clonado donde podrás realizar pruebas, simulaciones y cambios destructivos sin afectar la base de datos real de Procoquinal.
                            </p>
                            <button
                                onClick={handleToggleDemo}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center space-x-2"
                            >
                                <Beaker className="w-4 h-4" />
                                <span>Entrar al Modo Demo</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-orange-800 font-medium">Estás en un entorno seguro</h4>
                                    <p className="text-orange-700 text-sm mt-1">
                                        Cualquier cambio que realices en el inventario, ventas, clientes o configuraciones no afectará el sistema principal.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Controles de Datos */}
                                <div className="space-y-4">
                                    <h3 className="text-md font-semibold text-slate-900 border-b pb-2">Controles de Datos</h3>
                                    <button
                                        onClick={handleResetToReal}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3 text-left">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <RotateCcw className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">Jalar Datos Reales</div>
                                                <div className="text-sm text-slate-500">Reinicia el demo con una copia fresca</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Máquina del Tiempo (Checkpoints) */}
                                <div className="space-y-4">
                                    <h3 className="text-md font-semibold text-slate-900 border-b pb-2">Máquina del Tiempo</h3>
                                    
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={checkpointName}
                                            onChange={(e) => setCheckpointName(e.target.value)}
                                            placeholder="Nombre del punto de revisión..."
                                            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                                        />
                                        <button
                                            onClick={handleCreateCheckpoint}
                                            disabled={!checkpointName.trim()}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 text-sm font-medium inline-flex items-center space-x-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Guardar</span>
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                        {checkpoints.slice().reverse().map((cp, idx) => (
                                            <div key={cp.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                <div>
                                                    <div className="font-medium text-slate-900 text-sm">{cp.name}</div>
                                                    <div className="text-xs text-slate-500">{new Date(cp.timestamp).toLocaleString()}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleRestoreCheckpoint(cp.id, cp.name)}
                                                    className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200 transition-colors"
                                                >
                                                    Restaurar
                                                </button>
                                            </div>
                                        ))}
                                        {checkpoints.length === 0 && (
                                            <div className="text-center py-4 text-sm text-slate-500">
                                                No hay puntos de revisión guardados.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
