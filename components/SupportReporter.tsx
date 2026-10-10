import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Camera, CheckCircle, X, Send } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';

export const SupportReporter: React.FC = () => {
    const { isReportingMode, setIsReportingMode, supportScreenshots, addSupportScreenshot } = useEnterprise();
    const navigate = useNavigate();
    
    const [isCapturing, setIsCapturing] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [note, setNote] = useState('');

    if (!isReportingMode) return null;

    const takeScreenshot = async () => {
        setIsCapturing(true);
        // Hide the floating widget temporarily before capturing
        const reporterEl = document.getElementById('support-reporter-widget');
        if (reporterEl) reporterEl.style.display = 'none';

        try {
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                scale: window.devicePixelRatio || 1,
            });
            const imgData = canvas.toDataURL('image/png');
            setPreviewImage(imgData);
        } catch (e) {
            console.error('Failed to take screenshot', e);
            alert('Error al tomar captura de pantalla.');
        } finally {
            if (reporterEl) reporterEl.style.display = 'block';
            setIsCapturing(false);
        }
    };

    const handleSavePhoto = () => {
        if (previewImage) {
            addSupportScreenshot(previewImage, note);
            setPreviewImage(null);
            setNote('');
        }
    };

    const finishReporting = () => {
        setIsReportingMode(false);
        navigate('/configuracion?tab=soporte');
    };

    return (
        <>
            <div id="support-reporter-widget" className="fixed bottom-6 right-6 z-[9999] bg-white rounded-2xl shadow-2xl border border-indigo-200 p-5 w-80 animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Camera size={18} className="text-indigo-600" />
                        Modo Soporte
                    </h3>
                    <button onClick={() => setIsReportingMode(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                    Navega por la aplicación hasta donde ocurrió el incidente y haz clic en "Tomar Foto".
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={takeScreenshot}
                        disabled={isCapturing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        {isCapturing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={18} />}
                        {isCapturing ? 'Capturando...' : 'Tomar Foto'}
                    </button>

                    {supportScreenshots.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase">
                                Fotos Capturadas ({supportScreenshots.length})
                            </div>
                            <button 
                                onClick={finishReporting}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Reportar Incidente
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de previsualización */}
            {previewImage && (
                <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Previsualización de Captura</h3>
                            <button onClick={() => { setPreviewImage(null); setNote(''); }} className="text-slate-500 hover:text-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-200 p-4 flex items-center justify-center relative group">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                <span className="text-6xl font-black rotate-[-20deg] text-slate-900 tracking-widest uppercase">
                                    SCARPIAN AI SUPPORT
                                </span>
                            </div>
                            <img src={previewImage} alt="Screenshot" className="max-w-full shadow-2xl rounded-lg border border-slate-300" />
                        </div>
                        <div className="p-6 bg-white border-t border-slate-200 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Agregar Nota o Pie de Foto</label>
                                <input 
                                    type="text" 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Ej: Aquí es donde el botón no funciona al hacer clic..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => { setPreviewImage(null); setNote(''); }}
                                    className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSavePhoto}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
                                >
                                    <CheckCircle size={18} />
                                    Aceptar y Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
