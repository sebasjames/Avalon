import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthGateProps {
    children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Hardcoded password for temporary staging
    const CORRECT_PASSWORD = 'Avalon_2028!';

    useEffect(() => {
        // Check if previously authenticated in this session
        const authStatus = sessionStorage.getItem('avalon_staging_auth');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
        setIsChecking(false);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('avalon_staging_auth', 'true');
            setError(false);
        } else {
            setError(true);
            setPassword('');
        }
    };

    if (isChecking) {
        return <div className="h-screen w-full bg-slate-950 flex items-center justify-center"></div>;
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white text-center">Acceso Privado</h1>
                        <p className="text-slate-400 text-sm mt-2 text-center">Ingresa la clave de paso para visualizar el prototipo de Avalon ERP.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className={`flex items-center bg-slate-950 border rounded-xl overflow-hidden transition-colors ${error ? 'border-rose-500' : 'border-slate-800 focus-within:border-indigo-500'}`}>
                                <div className="pl-4 pr-3 text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(false);
                                    }}
                                    placeholder="Clave de acceso..."
                                    className="w-full bg-transparent border-none py-3 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-0 font-medium"
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p className="text-rose-500 text-xs font-bold mt-2 ml-1 animate-pulse">Clave incorrecta. Intenta de nuevo.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Ingresar <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
                
                <div className="text-center mt-6">
                    <p className="text-xs text-slate-600 font-medium tracking-wider">PROCOQUINAL &copy; 2026</p>
                </div>
            </div>
        </div>
    );
};
