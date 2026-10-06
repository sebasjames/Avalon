const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'SalesTeamProfiles.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const hasCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Remove createPortal import
content = content.replace("import { createPortal } from 'react-dom';\n", "");

// 2. Update state definition
const oldState = `    // Modal state for Meta Global Compendium
    const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<'metas' | 'comisiones'>('metas');

    useEscapeKey(() => {
        setIsGlobalModalOpen(false);
    }, isGlobalModalOpen);`;

const newState = `    // View mode: 'agent' for individual profile, 'global' for team metas compendium on current screen
    const [viewMode, setViewMode] = useState<'agent' | 'global'>('agent');
    const [activeModalTab, setActiveModalTab] = useState<'metas' | 'comisiones'>('metas');

    useEscapeKey(() => {
        if (viewMode === 'global') {
            setViewMode('agent');
        }
    }, viewMode === 'global');`;

if (!content.includes(oldState)) {
  console.error("Could not find oldState");
  process.exit(1);
}
content = content.replace(oldState, newState);

// 3. Update Left Sidebar triggers
const oldSidebarTriggers = `                    {/* Team KPI Mini Card (Interactive Clickable Trigger) */}
                    <div 
                        onClick={() => {
                            setActiveModalTab('metas');
                            setIsGlobalModalOpen(true);
                        }}
                        className="mt-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                        title="Haga clic para abrir el compendio detallado de metas globales y comisiones"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-700 uppercase group-hover:text-indigo-600 transition-colors">Meta Global</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center gap-0.5">
                                    Detalle <Sparkles className="w-2.5 h-2.5" />
                                </span>
                            </div>
                            <span className={\`text-xs font-bold px-2 py-0.5 rounded-full \${quotaAttainment >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>
                                {quotaAttainment.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: \`\${Math.min(quotaAttainment, 100)}%\` }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-slate-700 font-bold">{formatCOP(totalRevenue)}</span>
                            <span className="text-slate-400 font-medium">/ {formatCOP(totalQuota)}</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => {
                            setActiveModalTab('comisiones');
                            setIsGlobalModalOpen(true);
                        }}
                        className="mt-2 bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-300 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
                        title="Haga clic para ver el desglose de reglas de comisión aplicadas este mes"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">Comisiones Generadas</span>
                            <span className="text-[10px] text-indigo-600 underline font-semibold">Ver reglas</span>
                        </div>
                        <span className="text-sm font-black text-indigo-600">{formatCOP(totalCommissions)}</span>
                    </div>`;

const newSidebarTriggers = `                    {/* Team KPI Mini Card (Interactive Clickable Trigger to change view inline) */}
                    <div 
                        onClick={() => {
                            setActiveModalTab('metas');
                            setViewMode('global');
                        }}
                        className={\`mt-4 p-3.5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden \${
                            viewMode === 'global' && activeModalTab === 'metas'
                                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500 shadow-md'
                                : 'bg-white border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-md'
                        }\`}
                        title="Haga clic para ver el compendio de metas globales en la pantalla actual"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className={\`text-xs font-bold uppercase transition-colors \${
                                    viewMode === 'global' && activeModalTab === 'metas' ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-600'
                                }\`}>
                                    Meta Global
                                </span>
                                <span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 \${
                                    viewMode === 'global' && activeModalTab === 'metas'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                                }\`}>
                                    {viewMode === 'global' && activeModalTab === 'metas' ? 'En pantalla ✓' : 'Ver en pantalla'}
                                </span>
                            </div>
                            <span className={\`text-xs font-bold px-2 py-0.5 rounded-full \${quotaAttainment >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>
                                {quotaAttainment.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: \`\${Math.min(quotaAttainment, 100)}%\` }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-slate-700 font-bold">{formatCOP(totalRevenue)}</span>
                            <span className="text-slate-400 font-medium">/ {formatCOP(totalQuota)}</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => {
                            setActiveModalTab('comisiones');
                            setViewMode('global');
                        }}
                        className={\`mt-2 border p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs group \${
                            viewMode === 'global' && activeModalTab === 'comisiones'
                                ? 'bg-indigo-100/80 border-indigo-500 ring-2 ring-indigo-500 shadow-md'
                                : 'bg-indigo-50/70 hover:bg-indigo-50 border-indigo-100 hover:border-indigo-300'
                        }\`}
                        title="Haga clic para ver el desglose de comisiones en la pantalla actual"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">Comisiones Generadas</span>
                            <span className="text-[10px] text-indigo-600 underline font-semibold">
                                {viewMode === 'global' && activeModalTab === 'comisiones' ? 'En pantalla ✓' : 'Ver en pantalla'}
                            </span>
                        </div>
                        <span className="text-sm font-black text-indigo-600">{formatCOP(totalCommissions)}</span>
                    </div>`;

if (!content.includes(oldSidebarTriggers)) {
  console.error("Could not find oldSidebarTriggers");
  process.exit(1);
}
content = content.replace(oldSidebarTriggers, newSidebarTriggers);

// 4. Update Agent Selection in Left Sidebar
const oldAgentSelect = `                    {salesTeam.map((agent) => {
                        const percent = agent.quota > 0 ? (agent.actual / agent.quota) * 100 : 0;
                        const isSelected = selectedAgent.id === agent.id;
                        
                        return (
                            <div 
                                key={agent.id}
                                onClick={() => setSelectedAgentId(agent.id)}
                                className={\`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md group relative overflow-hidden \${
                                    isSelected 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                                }\`}`;

const newAgentSelect = `                    {salesTeam.map((agent) => {
                        const percent = agent.quota > 0 ? (agent.actual / agent.quota) * 100 : 0;
                        const isSelected = viewMode === 'agent' && selectedAgent.id === agent.id;
                        
                        return (
                            <div 
                                key={agent.id}
                                onClick={() => {
                                    setSelectedAgentId(agent.id);
                                    setViewMode('agent');
                                }}
                                className={\`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md group relative overflow-hidden cursor-pointer \${
                                    isSelected 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                                }\`}`;

if (!content.includes(oldAgentSelect)) {
  console.error("Could not find oldAgentSelect");
  process.exit(1);
}
content = content.replace(oldAgentSelect, newAgentSelect);

// 5. Replace right content and eliminate modal createPortal
// Extract the modal inner body from line 504 to line 805
// Let's find where the modal body begins and ends.
const modalContentMarker = `{activeModalTab === 'metas' ? (`;
const modalEndMarker = `                            )}\n                        </div>\n\n                        {/* Footer */}`;

const startIndex = content.indexOf(modalContentMarker);
const endIndex = content.indexOf(modalEndMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find modal markers: " + startIndex + ", " + endIndex);
  process.exit(1);
}

// Extract the exact inner content of the modal body
let modalBodyContent = content.substring(startIndex, endIndex + modalEndMarker.length);
// Replace any setIsGlobalModalOpen(false) inside modalBodyContent with setViewMode('agent')
modalBodyContent = modalBodyContent.replace(/setIsGlobalModalOpen\(false\);/g, "setViewMode('agent');");

// Now locate the whole right area starting at:
const rightAreaStart = `            {/* RIGHT MAIN CONTENT: AGENT DETAIL */}\n            <div className="flex-1 overflow-y-auto bg-slate-50 p-8 custom-scrollbar">`;

// And find where the file ends before `        </div>\n    );\n};`
const modalClosingMarker = `            {/* --- COMPENDIO DETALLADO DE METAS GLOBALES & COMISIONES --- */}`;

const rightAreaIndex = content.indexOf(rightAreaStart);
const modalClosingIndex = content.indexOf(modalClosingMarker);

if (rightAreaIndex === -1 || modalClosingIndex === -1) {
  console.error("Could not find right area markers: " + rightAreaIndex + ", " + modalClosingIndex);
  process.exit(1);
}

// The existing agent detail block:
const existingAgentDetail = content.substring(rightAreaIndex + `            {/* RIGHT MAIN CONTENT: AGENT DETAIL */}\n`.length, modalClosingIndex).trim();

// Now construct the new inline right main content:
const newRightMainContent = `            {/* RIGHT MAIN CONTENT: SWITCHABLE (GLOBAL COMPENDIUM vs AGENT DETAIL) */}
            {viewMode === 'global' ? (
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Global Compendium Header */}
                        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-600/30 border border-indigo-400/30 text-indigo-400 rounded-2xl">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        Compendio Ejecutivo: Metas Globales & Comisiones
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                            Mes Actual
                                        </span>
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Pacing corporativo, contribución individual por asesor y auditoría de reglas de compensación.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <button
                                    onClick={handleExportCompendioCSV}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                                    title="Descargar reporte en formato CSV"
                                >
                                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                                    Descargar CSV
                                </button>
                                <button
                                    onClick={() => setViewMode('agent')}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                                    title="Ver perfil individual de asesor"
                                >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Ver Asesor ({selectedAgent.name.split(' ')[0]})
                                </button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <button
                                onClick={() => setActiveModalTab('metas')}
                                className={\`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer \${
                                    activeModalTab === 'metas'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }\`}
                            >
                                <Target className="w-4 h-4" />
                                Metas Corporativas & Pacing del Equipo
                            </button>
                            <button
                                onClick={() => setActiveModalTab('comisiones')}
                                className={\`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer \${
                                    activeModalTab === 'comisiones'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }\`}
                            >
                                <DollarSign className="w-4 h-4" />
                                Resumen de Comisiones Configuradas ({activeCommissionRules.length} Reglas Activas)
                            </button>
                        </div>

                        {/* Global Content Body */}
                        <div className="space-y-6">
                            ` + modalBodyContent.replace(`                            )}\n                        </div>\n\n                        {/* Footer */}`, `                            )}`) + `
                        </div>

                        {/* Footer Bar */}
                        <div className="p-4 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-2xs">
                            <span className="text-xs text-slate-400 font-medium">
                                Datos consolidados en tiempo real desde el CRM y Facturación
                            </span>
                            <button
                                onClick={() => setViewMode('agent')}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Volver a Perfil de {selectedAgent.name}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                ` + existingAgentDetail + `
            )}`;

// Replace from rightAreaStart until the end of the return statement
const beforeRightArea = content.substring(0, rightAreaIndex);
const newFinalContent = beforeRightArea + newRightMainContent + `\n        </div>\n    );\n};\n`;

let result = newFinalContent;
if (hasCRLF) {
  result = result.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, result, 'utf8');
console.log("Successfully transformed SalesTeamProfiles.tsx into inline screen view!");
