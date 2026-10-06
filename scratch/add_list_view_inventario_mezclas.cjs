const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'InventarioMezclas.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add formatCOP import and LayoutGrid, List icons
if (!content.includes('formatCOP')) {
    content = content.replace(
        "import { motion, AnimatePresence } from 'motion/react';",
        "import { motion, AnimatePresence } from 'motion/react';\nimport { formatCOP } from '../utils/format';"
    );
}

if (!content.includes('LayoutGrid')) {
    content = content.replace(
        '    FlaskConical,\n',
        '    FlaskConical,\n    LayoutGrid,\n    List,\n'
    );
}

// 2. Add viewMode state
if (!content.includes('const [viewMode, setViewMode]')) {
    content = content.replace(
        "    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PIGMENTS' | 'BASES' | 'SOLVENTS'>('ALL');",
        "    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PIGMENTS' | 'BASES' | 'SOLVENTS'>('ALL');\n    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');"
    );
}

// 3. Add toggle buttons to Filter & Search Bar
const oldFilterGroup = `<button
                        onClick={() => setSelectedCategory('SOLVENTS')}
                        className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 \${selectedCategory === 'SOLVENTS' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}\`}
                    >
                        Solventes
                    </button>
                </div>
            </div>`;

const newFilterGroup = `<button
                        onClick={() => setSelectedCategory('SOLVENTS')}
                        className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 \${selectedCategory === 'SOLVENTS' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}\`}
                    >
                        Solventes
                    </button>
                </div>

                {/* View Mode Toggle (Grid vs Table) */}
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 \${
                            viewMode === 'grid' 
                                ? 'bg-white text-purple-700 shadow-2xs' 
                                : 'text-slate-500 hover:text-slate-800'
                        }\`}
                        title="Vista Tarjetas (Cilindros de nivel)"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden sm:inline">Tarjetas</span>
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 \${
                            viewMode === 'table' 
                                ? 'bg-white text-purple-700 shadow-2xs' 
                                : 'text-slate-500 hover:text-slate-800'
                        }\`}
                        title="Vista Lista / Tabla (Formato Catálogo de Inventario)"
                    >
                        <List className="w-4 h-4" />
                        <span className="hidden sm:inline">Lista</span>
                    </button>
                </div>
            </div>`;

const normalize = str => str.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(oldFilterGroup))) {
    const parts = normalize(content).split(normalize(oldFilterGroup));
    content = parts.join(normalize(newFilterGroup));
    console.log('Filter group toggle added');
} else {
    console.log('oldFilterGroup not matched directly');
}

// 4. Wrap Grid and add Table View
const oldGridStart = `            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">`;

const newGridStart = `            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">`;

if (normalize(content).includes(normalize(oldGridStart))) {
    const parts = normalize(content).split(normalize(oldGridStart));
    content = parts.join(normalize(newGridStart));
    console.log('Grid start updated with viewMode condition');
} else {
    console.log('oldGridStart not matched');
}

// And close grid + add table view before the modals
const oldGridEnd = `                    })}
                </div>
            )}

            {/* Modal: Ajustar Saldo / Pesar */}`;

const newGridEnd = `                    })}
                </div>
            ) : (
                /* Table / List View with identical format as SmartInventoryView */
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                                    <th className="p-4 w-4"></th>
                                    <th className="p-4">SKU / Producto</th>
                                    <th className="p-4">Familia / Tipo</th>
                                    <th className="p-4 text-center">Unidad</th>
                                    <th className="p-4 text-center">Saldo en Mesón</th>
                                    <th className="p-4 text-center w-40">Nivel Envase</th>
                                    <th className="p-4 text-center">Bodega Central (Sellados)</th>
                                    <th className="p-4 text-right">Valor en Mesón</th>
                                    <th className="p-4 text-center w-48">Acciones Rápidas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map(product => {
                                    const labStock = product.labStock || 0;
                                    const capacity = product.netWeightKg || product.netVolumeLiters || (product.baseUnit === 'GR' ? 1000 : 20);
                                    const unitName = product.baseUnit || 'GR';
                                    const percentLevel = Math.min(100, Math.round((labStock / capacity) * 100));
                                    const isLow = percentLevel <= 20;
                                    const unitCost = product.unitCost || 35000;
                                    const costPerUnit = capacity > 0 ? (unitCost / capacity) : 35;
                                    const totalValue = Math.round(labStock * costPerUnit);

                                    return (
                                        <tr 
                                            key={product.sku}
                                            className="hover:bg-purple-50/30 transition-colors group cursor-default"
                                        >
                                            {/* Indicator */}
                                            <td className="p-4">
                                                <div 
                                                    className={\`w-2.5 h-2.5 rounded-full \${
                                                        percentLevel > 50 ? 'bg-emerald-500' : percentLevel > 20 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
                                                    }\`}
                                                    title={\`Nivel: \${percentLevel}%\`}
                                                />
                                            </td>

                                            {/* SKU / Product */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors text-sm">
                                                        {product.name}
                                                    </span>
                                                    {isLow && (
                                                        <span className="text-[10px] font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                                                            Por Agotar
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                                                    <span>{product.sku}</span>
                                                    {product.brand && (
                                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-sans font-medium">
                                                            {product.brand}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Family */}
                                            <td className="p-4">
                                                <span className="text-xs font-medium text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-lg">
                                                    {product.family || product.category || 'Materia Prima'}
                                                </span>
                                            </td>

                                            {/* Base Unit */}
                                            <td className="p-4 text-center">
                                                <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                    {unitName}
                                                </span>
                                            </td>

                                            {/* Lab Stock */}
                                            <td className="p-4 text-center">
                                                <div className="font-black text-slate-900 text-sm">
                                                    {labStock} <span className="text-xs font-semibold text-slate-400">{unitName}</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                    {percentLevel}% del tarro
                                                </div>
                                            </td>

                                            {/* Level Gauge Bar */}
                                            <td className="p-4">
                                                <div className="w-36 mx-auto">
                                                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                                                        <span className="font-bold text-slate-700">{percentLevel}%</span>
                                                        <span>{capacity} {unitName}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                                                        <div 
                                                            className={\`h-full rounded-full transition-all duration-500 \${
                                                                percentLevel > 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                                                percentLevel > 20 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                                'bg-gradient-to-r from-rose-500 to-rose-600'
                                                            }\`}
                                                            style={{ width: \`\${percentLevel}%\` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Sealed in warehouse */}
                                            <td className="p-4 text-center">
                                                <span className={\`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border \${
                                                    product.totalStock > 0 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }\`}>
                                                    <Boxes className="w-3 h-3" />
                                                    {product.totalStock} {product.totalStock === 1 ? 'cerrado' : 'cerrados'}
                                                </span>
                                            </td>

                                            {/* Cost in lab */}
                                            <td className="p-4 text-right">
                                                <div className="font-bold text-xs text-slate-800">
                                                    {formatCOP(totalValue)}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    ~{formatCOP(costPerUnit)}/{unitName}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setAdjustModalProduct(product);
                                                            setAdjustValue(labStock.toString());
                                                        }}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg text-xs font-bold transition-all shadow-2xs"
                                                        title="Pesar envase y registrar tara real"
                                                    >
                                                        <Scale className="w-3 h-3" />
                                                        Ajustar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (product.totalStock <= 0) {
                                                                alert('No hay unidades selladas disponibles en Bodega Central para destapar.');
                                                                return;
                                                            }
                                                            setAuthModalData({
                                                                product,
                                                                units: 1,
                                                                usedQty: 0,
                                                                reason: 'Apertura de +1 tarro adicional desde mesón'
                                                            });
                                                            setOperatorPinInput('');
                                                            setAuthError('');
                                                        }}
                                                        disabled={product.totalStock <= 0}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                                                        title="Validar ID para destapar 1 unidad adicional"
                                                    >
                                                        <PlusCircle className="w-3 h-3" />
                                                        +1
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(\`¿Seguro que deseas vaciar/marcar como agotado el envase de \${product.name}?\`)) {
                                                                updateLabStock(product.sku, 0);
                                                            }
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Marcar tarro como vacío / retirar del mesón"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Ajustar Saldo / Pesar */}`;

if (normalize(content).includes(normalize(oldGridEnd))) {
    const parts = normalize(content).split(normalize(oldGridEnd));
    content = parts.join(normalize(newGridEnd));
    console.log('Grid end and Table view added successfully');
} else {
    console.log('oldGridEnd not matched directly');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('InventarioMezclas.tsx written successfully');
