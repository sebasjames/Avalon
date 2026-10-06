const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../components/InventarioMezclas.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add import for HistorialMezclasModal
if (!code.includes('HistorialMezclasModal')) {
    code = code.replace(
        "import { Product, Category } from '../types';",
        "import { Product, Category } from '../types';\nimport { HistorialMezclasModal } from './HistorialMezclasModal';"
    );
}

// 2. Add History to lucide-react imports if not there
if (!code.includes('History,')) {
    code = code.replace(
        "FlaskConical,",
        "FlaskConical,\n    History,"
    );
}

// 3. Add state for historyModalOpen
if (!code.includes('historyModalOpen')) {
    code = code.replace(
        "const [openManualModalOpen, setOpenManualModalOpen] = useState(false);",
        "const [openManualModalOpen, setOpenManualModalOpen] = useState(false);\n    const [historyModalOpen, setHistoryModalOpen] = useState(false);"
    );
}

// 4. Add the History button next to Destapar Envase
const oldButtonContainer = `<div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpenManualModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Destapar Envase
                    </button>
                </div>`;

const newButtonContainer = `<div className="flex items-center gap-3">
                    <button
                        onClick={() => setHistoryModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold transition-all shadow-2xs active:scale-95"
                    >
                        <History className="w-4 h-4 text-purple-600" />
                        Historial de Consumo
                    </button>

                    <button
                        onClick={() => setOpenManualModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Destapar Envase
                    </button>
                </div>`;

if (code.includes(oldButtonContainer)) {
    code = code.replace(oldButtonContainer, newButtonContainer);
} else {
    // If formatting differs slightly, replace the button block
    const target = 'onClick={() => setOpenManualModalOpen(true)}';
    const targetStart = code.lastIndexOf('<div className="flex items-center gap-3">', code.indexOf(target));
    const targetEnd = code.indexOf('</div>', targetStart) + 6;
    if (targetStart !== -1 && targetEnd !== -1) {
        code = code.substring(0, targetStart) + newButtonContainer + code.substring(targetEnd);
    }
}

// 5. Mount the modal at the end
if (!code.includes('<HistorialMezclasModal')) {
    code = code.replace(
        "            </AnimatePresence>\n        </div>",
        "            </AnimatePresence>\n\n            {/* Modal de Historial y Trazabilidad Detallado */}\n            <HistorialMezclasModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} />\n        </div>"
    );
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('InventarioMezclas.tsx updated with Historial button and modal!');
