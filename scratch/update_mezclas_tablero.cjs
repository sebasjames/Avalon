const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../components/MezclasTablero.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Imports
if (!code.includes("import { MezclasCatalogo }")) {
    code = code.replace(
        "import { LabelPreviewModal, MezclaLabelData } from './LabelPreviewModal';",
        "import { MezclasCatalogo } from './MezclasCatalogo';\nimport { LabelPreviewModal, MezclaLabelData } from './LabelPreviewModal';"
    );
    code = code.replace(
        "import { Clock, Beaker, CheckCircle, PackageCheck, AlertCircle, Play, History, KanbanSquare, List, Printer, Tag, Lock, AlertTriangle, FileText, MessageSquare, User, X } from 'lucide-react';",
        "import { Clock, Beaker, CheckCircle, PackageCheck, AlertCircle, Play, History, KanbanSquare, List, Printer, Tag, Lock, AlertTriangle, FileText, MessageSquare, User, X, Database, Save } from 'lucide-react';"
    );
    console.log('Updated imports in MezclasTablero.tsx');
}

// 2. useEnterprise & View state
code = code.replace(
    "const { addKardexTransaction, updateInventoryStock, mezclaOrders, updateMezclaOrder, productionOrders, addProductionOrder } = useEnterprise();",
    "const { addKardexTransaction, updateInventoryStock, mezclaOrders, updateMezclaOrder, productionOrders, addProductionOrder, mezclaCatalogo, saveMezclaToCatalogo } = useEnterprise();"
);

code = code.replace(
    "const [view, setView] = useState<'KANBAN' | 'LISTA' | 'HISTORIAL'>('KANBAN');",
    "const [view, setView] = useState<'KANBAN' | 'LISTA' | 'HISTORIAL' | 'CATALOGO'>('KANBAN');"
);

// 3. Auto-save in updateStatus when status === READY
const autoSaveLogic = `
        // 4. Auto-alimentar la Base de Datos de Mezclas Reutilizables
        if (orderToUpdate && newStatus === MezclaStatus.READY && orderToUpdate.status !== MezclaStatus.READY) {
            saveMezclaToCatalogo({
                name: \`\${orderToUpdate.colorId} - \${orderToUpdate.baseName}\`,
                colorCode: orderToUpdate.colorId,
                clientName: orderToUpdate.clientName || 'General',
                baseSku: orderToUpdate.baseSku,
                baseName: orderToUpdate.baseName,
                baseType: orderToUpdate.baseType || 'SOLVENTE INTERNO',
                formula: orderToUpdate.formula,
                unit: 'GL',
                category: orderToUpdate.clientName && orderToUpdate.clientName !== 'General' && orderToUpdate.clientName !== 'Catálogo General' ? 'ESPECIAL_CLIENTE' : 'ESTANDAR',
                createdByUser: orderToUpdate.operatorName || 'Operador de Planta',
                instructions: 'Fórmula archivada automáticamente tras finalizar orden en Laboratorio KDS.'
            });
        }`;

if (!code.includes('// 4. Auto-alimentar la Base de Datos de Mezclas Reutilizables')) {
    code = code.replace(
        "addProductionOrder(newBatch);\n        }",
        "addProductionOrder(newBatch);\n        }" + autoSaveLogic
    );
    console.log('Added auto-save logic on READY');
}

// 4. Save button on OrderCard
const saveButtonCode = `
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                saveMezclaToCatalogo({
                                    name: \`\${order.colorId} - \${order.baseName}\`,
                                    colorCode: order.colorId,
                                    clientName: order.clientName || 'General',
                                    baseSku: order.baseSku,
                                    baseName: order.baseName,
                                    baseType: order.baseType,
                                    formula: order.formula,
                                    unit: 'GL',
                                    category: order.clientName && order.clientName !== 'General' ? 'ESPECIAL_CLIENTE' : 'ESTANDAR',
                                    createdByUser: order.operatorName || 'Operador de Planta'
                                });
                                setLastDeductionMessage(\`💾 Fórmula \${order.colorId} (\${order.clientName}) guardada en la Base de Datos de Mezclas.\`);
                                setTimeout(() => setLastDeductionMessage(null), 4000);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Guardar fórmula en Base de Datos de Mezclas"
                        >
                            <Save className="w-4 h-4" />
                        </button>`;

if (!code.includes('title="Guardar fórmula en Base de Datos de Mezclas"')) {
    code = code.replace(
        "title=\"Notas de Laboratorio\"\n                        >",
        "title=\"Notas de Laboratorio\"\n                        >" + saveButtonCode
    );
    console.log('Added Save button to OrderCard');
}

// 5. Add Tab Button
const catalogTabButton = `
                    <button 
                        onClick={() => setView('CATALOGO')}
                        className={\`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all \${view === 'CATALOGO' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}\`}
                    >
                        <Database className="w-5 h-5 text-indigo-600" />
                        Base de Datos de Mezclas
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                            {mezclaCatalogo.length}
                        </span>
                    </button>`;

if (!code.includes("onClick={() => setView('CATALOGO')}")) {
    code = code.replace(
        "Historial\n                    </button>",
        "Historial\n                    </button>" + catalogTabButton
    );
    console.log('Added CATALOGO tab button');
}

// 6. Render CATALOGO view
const catalogViewRender = `
            {view === 'CATALOGO' && (
                <MezclasCatalogo onOrderCreated={() => setView('KANBAN')} />
            )}
`;

if (!code.includes("<MezclasCatalogo onOrderCreated")) {
    code = code.replace(
        "{view === 'HISTORIAL' && (",
        catalogViewRender + "\n            {view === 'HISTORIAL' && ("
    );
    console.log('Added MezclasCatalogo view render');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('MezclasTablero.tsx updated successfully');
