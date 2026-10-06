const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'SalesTeamProfiles.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const hasCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

const oldBlock = `                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-4">
                                    <div className="flex items-center text-indigo-700 mb-1">
                                        <DollarSign className="w-5 h-5 mr-1" />
                                        <span className="font-bold text-xl">{formatCOP(selectedAgent.commission)}</span>
                                    </div>
                                    <div className="text-xs text-indigo-500/80 font-medium">Comisiones (Reglas Activas)</div>
                                </div>`;

const newBlock = `                                <div 
                                    onClick={() => navigate('/staff/matrix')}
                                    className="bg-indigo-50 hover:bg-indigo-100/90 p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 mt-4 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                                    title="Haga clic para ir al panel de configuración de comisiones (Matrix)"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center text-indigo-700">
                                            <span className="font-bold text-xl">{formatCOP(selectedAgent.commission)}</span>
                                        </div>
                                        <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center gap-0.5">
                                            Configurar <ArrowUpRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-indigo-600/90 font-medium">
                                        <span>Comisiones (Reglas Activas)</span>
                                        <span className="text-[10px] underline font-bold group-hover:text-indigo-800">
                                            Panel de Configuración &rarr;
                                        </span>
                                    </div>
                                </div>`;

if (!content.includes(oldBlock)) {
  console.error("Could not find oldBlock");
  process.exit(1);
}

content = content.replace(oldBlock, newBlock);

if (hasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully wired navigation to commissions configuration panel!");
