import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateInsight } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'system';
  content: string;
  isTyping?: boolean;
}

export const IntelligenceHub: React.FC = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'Hola. Soy el Sistema de Inteligencia Procoquinal OS. Tengo acceso a tus datos de inventario, ventas y producción en tiempo real. ¿En qué puedo ayudarte hoy?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasRunAutoPrompt = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle auto-prompt from navigation (e.g. from Smart View)
  useEffect(() => {
    if (location.state?.autoPrompt && !hasRunAutoPrompt.current) {
        hasRunAutoPrompt.current = true;
        handleSend(location.state.autoPrompt);
        // Clear history state so refresh doesn't re-trigger
        window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleSend = async (text: string = input) => {
    const prompt = text.trim();
    if (!prompt) return;

    const userMsg: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateInsight(prompt);
      
      // Add system message with typing effect
      const systemMsg: Message = { role: 'system', content: response, isTyping: true };
      setMessages(prev => [...prev, systemMsg]);
      
      // Simulate typing completion
      setTimeout(() => {
        setMessages(prev => prev.map((m, i) => 
          i === prev.length - 1 ? { ...m, isTyping: false } : m
        ));
      }, 500);

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Identificar riesgos de inventario silencioso",
    "¿Qué productos tienen mejor rendimiento (ABC)?",
    "Sugerir estrategia de bundles para ítems lentos",
    "Calcular salud del inventario"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] m-4 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="font-semibold text-lg tracking-tight">Inteligencia del Sistema</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-xs text-slate-400 font-medium">Potenciado por Gemini AI • Conectado al ERP</p>
                    </div>
                </div>
            </div>
            <button 
              onClick={() => setMessages([{ role: 'system', content: 'Chat reiniciado. ¿En qué más puedo ayudarte?' }])}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Reiniciar Chat"
            >
              <RefreshCw size={18} />
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                      <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                            msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'
                          }`}>
                              {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
                          </div>
                          <div className={`p-5 rounded-3xl shadow-sm text-sm leading-relaxed ${
                              msg.role === 'user' 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                          }`}>
                              {msg.role === 'system' ? (
                                <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-headings:mb-3 prose-headings:mt-4 first:prose-headings:mt-0">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-line">{msg.content}</p>
                              )}
                          </div>
                      </div>
                  </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="flex justify-start"
                 >
                    <div className="flex gap-4 max-w-[80%]">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-3">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                            </div>
                            <span className="text-sm font-medium text-slate-500">Analizando datos del sistema...</span>
                        </div>
                    </div>
                 </motion.div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
             {messages.length <= 2 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {suggestions.map(s => (
                        <button 
                            key={s} 
                            onClick={() => handleSend(s)}
                            className="text-xs font-medium px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-all border border-indigo-100 hover:border-indigo-200 shadow-sm"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
            <div className="relative group">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Pregunta sobre inventario, tendencias de ventas o producción..."
                    className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm transition-all group-hover:border-slate-300"
                    rows={2}
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="absolute right-3 bottom-3 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <div className="flex justify-between items-center mt-3 px-1">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Procoquinal OS v2.4 • Intelligence Engine</p>
              <p className="text-[10px] text-slate-400">Verifica decisiones críticas de inventario.</p>
            </div>
        </div>
    </div>
  );
};
