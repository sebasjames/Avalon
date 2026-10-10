import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, CheckCircle2, AlertTriangle, Clock, ArrowRight,
  ExternalLink, Sparkles, X, Copy, Check, FileText, ShoppingCart,
  Calculator, Boxes, FlaskConical, Users, Truck, Settings, ChevronRight,
  ChevronDown, AlertCircle, HelpCircle, Table, BookMarked, ArrowUpRight,
  Folder, FolderOpen
} from 'lucide-react';
import {
  HumanScenario,
  ALL_AVALON_SCENARIOS,
  buildHierarchicalTopics,
  searchScenariosPredictive,
  ScoredScenario
} from '../data/scenarios';

export const AvalonSupportCenter: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('ESC-POS-01');
  
  // Nivel 1 (Módulos abiertos) - Por defecto todos cerrados (se abren al hacer clic o seleccionar un artículo)
  const [openModules, setOpenModules] = useState<string[]>([]);

  // Nivel 2 (Subtemas / Carpetas abiertas) - Por defecto todos cerrados
  const [openSubtopics, setOpenSubtopics] = useState<string[]>([]);

  const [viewTab, setViewTab] = useState<'docs' | 'table'>('docs');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Predictive search dropdown states
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close predictive dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Currently selected scenario object
  const activeScenario = useMemo(() => {
    return ALL_AVALON_SCENARIOS.find(s => s.id === activeScenarioId) || ALL_AVALON_SCENARIOS[0];
  }, [activeScenarioId]);

  // Hierarchical 3-Level Topics Structure
  const hierarchicalTopics = useMemo(() => {
    return buildHierarchicalTopics(ALL_AVALON_SCENARIOS);
  }, []);

  // Motor de Búsqueda Predictiva Instantánea con ponderación y jerga
  const searchResults: ScoredScenario[] = useMemo(() => {
    return searchScenariosPredictive(searchQuery, ALL_AVALON_SCENARIOS, 9);
  }, [searchQuery]);

  const autocompleteSuggestions = useMemo(() => {
    return searchResults.map(r => r.scenario);
  }, [searchResults]);

  // Escenarios para la Gran Tabla QA (filtrados en tiempo real por búsqueda)
  const tableScenarios = useMemo(() => {
    if (!searchQuery.trim()) return ALL_AVALON_SCENARIOS;
    return searchScenariosPredictive(searchQuery, ALL_AVALON_SCENARIOS, 370).map(r => r.scenario);
  }, [searchQuery]);

  // Related articles suggestion for active scenario
  const relatedArticles = useMemo(() => {
    return ALL_AVALON_SCENARIOS.filter(s => 
      s.id !== activeScenario.id && 
      (s.subtopic === activeScenario.subtopic || s.module === activeScenario.module)
    ).slice(0, 3);
  }, [activeScenario]);

  const toggleModule = (moduleName: string) => {
    setOpenModules(prev => 
      prev.includes(moduleName) ? prev.filter(m => m !== moduleName) : [...prev, moduleName]
    );
  };

  const toggleSubtopic = (subtopicName: string) => {
    setOpenSubtopics(prev => 
      prev.includes(subtopicName) ? prev.filter(s => s !== subtopicName) : [...prev, subtopicName]
    );
  };

  const selectScenario = (scenario: HumanScenario) => {
    setActiveScenarioId(scenario.id);
    if (!openModules.includes(scenario.module)) {
      setOpenModules(prev => [...prev, scenario.module]);
    }
    if (!openSubtopics.includes(scenario.subtopic)) {
      setOpenSubtopics(prev => [...prev, scenario.subtopic]);
    }
  };

  const copyProcedure = (scenario: HumanScenario) => {
    const text = `📘 ${scenario.title}\n📁 Módulo: ${scenario.module} > ${scenario.subtopic}\n\n${scenario.summary}\n\n` +
      scenario.steps.map((s, idx) => `${idx + 1}. ${s.title}: ${s.instruction}`).join('\n') +
      `\n\n⚠️ Qué hacer si falla: ${scenario.contingency}`;
    navigator.clipboard.writeText(text);
    setCopiedId(scenario.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchFocused || autocompleteSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev < autocompleteSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : autocompleteSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < autocompleteSuggestions.length) {
        const item = autocompleteSuggestions[activeSuggestionIndex];
        selectScenario(item);
        setSearchQuery('');
        setIsSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    try {
      const cleanQ = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${cleanQ})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <span key={i} className="text-indigo-600 font-bold bg-indigo-50 px-0.5 rounded">{part}</span>
        ) : part
      );
    } catch {
      return text;
    }
  };

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'pos': return ShoppingCart;
      case 'produccion': return FlaskConical;
      case 'inventario': return Boxes;
      case 'contabilidad': return Calculator;
      case 'crm': return Users;
      case 'logistica': return Truck;
      case 'configuracion': return Settings;
      default: return BookOpen;
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      {/* HEADER MINIMALISTA & BÚSQUEDA */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookMarked size={20} className="text-slate-800" />
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Manual de Usuario & Documentación Avalon
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Buscador predictivo instantáneo con diccionario de jerga operativa sobre {ALL_AVALON_SCENARIOS.length} escenarios auditados.
            </p>
          </div>

          {/* CONTROLES SUPERIORES: BUSCADOR INTELIGENTE & SWITCH DE VISTA */}
          <div className="flex items-center gap-3">
            {/* SEARCH BAR PREDICTIVO */}
            <div ref={searchContainerRef} className="relative w-full sm:w-96">
              <div className={`flex items-center bg-white border rounded-xl px-3 py-2 transition-all ${
                isSearchFocused ? 'border-slate-800 ring-2 ring-slate-100 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                    setActiveSuggestionIndex(-1);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={handleKeyDown}
                  placeholder='Buscar por jerga (ej: "fiado", "tirilla", "z", "cuñete", "bascula")...'
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* POPUP DE SUGERENCIAS PREDICTIVAS CON RECONOCIMIENTO DE JERGA */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 divide-y divide-slate-100">
                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{searchQuery ? `Sugerencias inmediatas (${searchResults.length})` : 'Consultas frecuentes de mostrador'}</span>
                    <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-600">⚡ Sub-milisegundo</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {searchResults.map((result, idx) => {
                      const item = result.scenario;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            selectScenario(item);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className={`w-full text-left p-3 text-xs flex items-center justify-between gap-3 transition-colors ${
                            idx === activeSuggestionIndex ? 'bg-indigo-50/70 text-indigo-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {item.id}
                              </span>
                              {result.matchedField === 'trigger' && result.matchedTrigger && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full">
                                  ⚡ Jerga: {result.matchedTrigger}
                                </span>
                              )}
                              {result.matchedField === 'id' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full">
                                  Coincidencia Exacta ID
                                </span>
                              )}
                            </div>
                            <p className="truncate font-semibold text-slate-900">{highlightMatch(item.title, searchQuery)}</p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.module} › {item.subtopic}</p>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* VISTA TABS: MANUAL VS MATRIZ TABLA */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                onClick={() => setViewTab('docs')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewTab === 'docs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setViewTab('table')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewTab === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Gran Tabla QA {searchQuery ? `(${tableScenarios.length})` : `(${ALL_AVALON_SCENARIOS.length})`}
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* CUERPO DEL MANUAL: NAVEGACIÓN JERÁRQUICA DE 3 NIVELES */}
      {viewTab === 'docs' ? (
        <div className="flex flex-col lg:flex-row gap-8 pt-6">
          {/* LEFT SIDEBAR NAVIGATION: NIVEL 1 (MÓDULO) -> NIVEL 2 (SUBTEMA) -> NIVEL 3 (ARTÍCULO) */}
          <aside className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-6 space-y-4">
            <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Estructura de Temas</span>
              <div className="flex items-center gap-2">
                {openModules.length > 0 && (
                  <button 
                    onClick={() => { setOpenModules([]); setOpenSubtopics([]); }}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold lowercase transition-colors cursor-pointer"
                  >
                    cerrar todos
                  </button>
                )}
                <span>{ALL_AVALON_SCENARIOS.length} guías</span>
              </div>
            </div>

            <nav className="space-y-4 custom-scrollbar max-h-[750px] overflow-y-auto pr-1">
              {hierarchicalTopics.map((group) => {
                const Icon = getModuleIcon(group.moduleId);
                const isModOpen = openModules.includes(group.moduleName);
                const hasActiveArticle = group.subtopics.some(st => 
                  st.articles.some(a => a.id === activeScenarioId)
                );

                return (
                  <div key={group.moduleId} className="space-y-1">
                    {/* NIVEL 1: MÓDULO PRINCIPAL */}
                    <button
                      onClick={() => toggleModule(group.moduleName)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-black rounded-xl transition-all ${
                        hasActiveArticle 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon size={14} className={hasActiveArticle ? 'text-indigo-400' : 'text-slate-500'} />
                        <span className="truncate">{group.moduleName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          hasActiveArticle ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/70 text-slate-600'
                        }`}>
                          {group.totalArticles}
                        </span>
                        {isModOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </button>

                    {/* NIVEL 2: SUBTEMAS / CARPETAS FUNCIONALES */}
                    {isModOpen && (
                      <div className="pl-2 space-y-2 pt-1">
                        {group.subtopics.map((sub) => {
                          const isSubOpen = openSubtopics.includes(sub.name);
                          const hasActiveSub = sub.articles.some(a => a.id === activeScenarioId);

                          return (
                            <div key={sub.name} className="space-y-0.5 border-l-2 border-slate-100 ml-2 pl-2">
                              <button
                                onClick={() => toggleSubtopic(sub.name)}
                                className={`w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                                  hasActiveSub ? 'text-indigo-900 bg-indigo-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  {isSubOpen ? (
                                    <FolderOpen size={13} className="text-slate-400 shrink-0" />
                                  ) : (
                                    <Folder size={13} className="text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate">{sub.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {sub.articles.length}
                                </span>
                              </button>

                              {/* NIVEL 3: ARTÍCULOS / ESCENARIOS ESPECÍFICOS */}
                              {isSubOpen && (
                                <div className="pl-4 space-y-0.5 py-0.5">
                                  {sub.articles.map((item) => {
                                    const isCurrent = item.id === activeScenarioId;
                                    return (
                                      <button
                                        key={item.id}
                                        onClick={() => selectScenario(item)}
                                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-all flex items-start justify-between gap-2 ${
                                          isCurrent
                                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                      >
                                        <span className="line-clamp-2 leading-snug">{item.title}</span>
                                        {item.status === 'aprobado' ? (
                                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${isCurrent ? 'bg-white' : 'bg-emerald-500'}`} />
                                        ) : (
                                          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 bg-amber-400" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* RIGHT READING CONTENT PANE (EL ARTÍCULO CON EL PASO A PASO EN PANTALLA) */}
          <main className="flex-1 min-w-0 max-w-4xl space-y-8 lg:pl-2">
            {/* Breadcrumb & Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span>Manual</span>
                <span>/</span>
                <span className="text-slate-600 font-medium">{activeScenario.module}</span>
                <span>/</span>
                <span className="text-slate-700 font-semibold">{activeScenario.subtopic}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {activeScenario.id}
                </span>

                {activeScenario.status === 'aprobado' ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 size={12} /> Verificado
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                    <Clock size={12} /> Pendiente Homologación
                  </span>
                )}
              </div>
            </div>

            {/* Título Principal */}
            <div className="space-y-2">
              <div className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 font-semibold text-[11px] rounded-md border border-blue-200/60">
                {activeScenario.category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight leading-snug">
                {activeScenario.title}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed pt-1">
                {activeScenario.summary}
              </p>
            </div>

            {/* Resultado Esperado */}
            <div className="border-l-3 border-blue-500 pl-4 py-1 space-y-1">
              <span className="font-bold uppercase tracking-wider text-blue-700 text-[11px] block">
                Comportamiento Esperado:
              </span>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                {activeScenario.expectedResult}
              </p>
            </div>

            {/* PASO A PASO NUMERADO: TEXTO CONTINUO SIN CARDS, TÍTULOS EN AZUL */}
            <div className="space-y-6 pt-2">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  Procedimiento Paso a Paso:
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {activeScenario.steps.length} pasos
                </span>
              </div>

              <div className="space-y-7">
                {activeScenario.steps.map((st, index) => (
                  <div key={index} className="space-y-2">
                    {/* TÍTULO EN AZUL MÁS GRANDE */}
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xl font-black text-blue-600 font-mono shrink-0">
                        {index + 1}.
                      </span>
                      <h3 className="text-lg font-bold text-blue-600 tracking-tight">
                        {st.title}
                      </h3>
                    </div>

                    {/* TEXTO DE INSTRUCCIÓN DIRECTO */}
                    <p className="text-sm text-slate-700 leading-relaxed pl-6">
                      {st.instruction}
                    </p>

                    {/* PRO TIP / ADVERTENCIA EN TEXTO LIMPIO SIN CARDS */}
                    {st.proTip && (
                      <div className="pl-6 pt-1">
                        <p className="text-xs text-slate-700 leading-relaxed border-l-2 border-blue-400 pl-3 py-0.5">
                          <span className="font-bold text-blue-700">💡 Pro Tip: </span>
                          {st.proTip}
                        </p>
                      </div>
                    )}

                    {st.warning && (
                      <div className="pl-6 pt-1">
                        <p className="text-xs text-amber-900 leading-relaxed border-l-2 border-amber-500 pl-3 py-0.5 bg-amber-50/50 rounded-r">
                          <span className="font-bold text-amber-700">⚠️ Importante: </span>
                          {st.warning}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* QUÉ HACER SI ALGO SALE MAL (CONTINGENCIA SIN CARD) */}
            <div className="pt-6 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500 shrink-0" />
                <h3 className="text-base font-bold text-orange-600">
                  ¿Qué hacer si algo no sale como se esperaba o falla?
                </h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed pl-6">
                {activeScenario.contingency}
              </p>
            </div>

            {/* BARRA DE ACCIONES INFERIOR */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => copyProcedure(activeScenario)}
                className="text-slate-800 hover:text-black text-sm font-bold transition-all flex items-center gap-1.5"
              >
                {copiedId === activeScenario.id ? (
                  <>
                    <Check size={16} />
                    <span>¡Pasos copiados!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copiar guía al portapapeles</span>
                  </>
                )}
              </button>

              {activeScenario.route && (
                <button
                  onClick={() => navigate(activeScenario.route!)}
                  className="text-slate-800 hover:text-black text-sm font-bold transition-all flex items-center gap-1.5"
                >
                  <span>{activeScenario.routeLabel || 'Ir a este módulo'}</span>
                  <ArrowUpRight size={16} />
                </button>
              )}
            </div>

            {/* ARTÍCULOS RELACIONADOS SUGERIDOS (SOLO TEXTO) */}
            {relatedArticles.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-2">
                <div className="text-sm font-bold text-slate-900">
                  Artículos relacionados:
                </div>
                <ul className="space-y-1 list-disc pl-5 text-slate-900">
                  {relatedArticles.map(rel => (
                    <li key={rel.id}>
                      <button
                        onClick={() => selectScenario(rel)}
                        className="text-sm font-medium text-slate-800 hover:text-black text-left transition-all underline decoration-slate-300 underline-offset-4"
                      >
                        {rel.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </main>
        </div>
      ) : (
        /* VISTA TABLA DE AUDITORÍA CLÁSICA MINIMALISTA */
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {searchQuery ? `Filtrando ${tableScenarios.length} de ${ALL_AVALON_SCENARIOS.length} escenarios` : `Matriz de auditoría completa de los ${ALL_AVALON_SCENARIOS.length} escenarios evaluados`}
            </span>
            <span className="font-bold text-emerald-700">Índice Operativo: 100% Verificado</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-28">ID</th>
                    <th className="py-3 px-4 w-36">Módulo</th>
                    <th className="py-3 px-4 w-48">Subtema</th>
                    <th className="py-3 px-6">Escenario / Pregunta Humana</th>
                    <th className="py-3 px-6">Resultado Esperado</th>
                    <th className="py-3 px-4 w-32 text-center">Estado</th>
                    <th className="py-3 px-4 w-24 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableScenarios.map((sc) => (
                    <tr 
                      key={sc.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        {sc.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {sc.module}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {sc.subtopic}
                      </td>
                      <td className="py-3.5 px-6">
                        <button
                          onClick={() => {
                            selectScenario(sc);
                            setViewTab('docs');
                          }}
                          className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors"
                        >
                          {sc.title}
                        </button>
                        <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{sc.summary}</p>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {sc.expectedResult}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {sc.status === 'aprobado' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[11px] border border-emerald-200">
                            <CheckCircle2 size={11} /> Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold text-[11px] border border-amber-200">
                            <Clock size={11} /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            selectScenario(sc);
                            setViewTab('docs');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all"
                        >
                          Ver Guía
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
