const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'SalesTeamProfiles.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const hasCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Replace the agent card progress value:
const oldCardValue = `                                    <div className="flex justify-between text-xs font-medium opacity-90">
                                        <span>Logro: {percent.toFixed(0)}%</span>
                                        <span>\${(agent.actual/1000).toFixed(0)}k</span>
                                    </div>`;

const newCardValue = `                                    <div className="flex justify-between text-xs font-medium opacity-90">
                                        <span>Logro: {percent.toFixed(0)}%</span>
                                        <span className="font-bold">{formatCOP(agent.actual)}</span>
                                    </div>`;

if (!content.includes(oldCardValue)) {
  console.error("Could not find oldCardValue");
  process.exit(1);
}
content = content.replace(oldCardValue, newCardValue);

// 2. Replace the agent detail metrics:
const oldMetrics = `                                <div className="text-slate-500 font-medium text-sm">Revenue Actual</div>
                                <div className="text-3xl font-bold text-slate-900 mt-2">\${selectedAgent.actual.toLocaleString('es-CO')} COP</div>
                                <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                                    <div className={\`h-2 rounded-full \${selectedAgent.color}\`} style={{ width: \`\${Math.min((selectedAgent.actual/selectedAgent.quota)*100, 100)}%\` }}></div>
                                </div>
                                <div className="mt-2 text-xs flex justify-between text-slate-400">
                                    <span>Progreso</span>
                                    <span>Meta: \${selectedAgent.quota.toLocaleString('es-CO')} COP</span>
                                </div>`;

const newMetrics = `                                <div className="text-slate-500 font-medium text-sm">Revenue Actual</div>
                                <div className="text-3xl font-bold text-slate-900 mt-2">{formatCOP(selectedAgent.actual)}</div>
                                <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                                    <div className={\`h-2 rounded-full \${selectedAgent.color}\`} style={{ width: \`\${Math.min((selectedAgent.actual/selectedAgent.quota)*100, 100)}%\` }}></div>
                                </div>
                                <div className="mt-2 text-xs flex justify-between text-slate-400">
                                    <span>Progreso</span>
                                    <span>Meta: {formatCOP(selectedAgent.quota)}</span>
                                </div>`;

if (!content.includes(oldMetrics)) {
  console.error("Could not find oldMetrics");
  process.exit(1);
}
content = content.replace(oldMetrics, newMetrics);

// 3. Replace commission in agent detail:
const oldComm = `                                        <span className="font-bold text-xl">\${selectedAgent.commission.toLocaleString('es-CO')}</span>`;
const newComm = `                                        <span className="font-bold text-xl">{formatCOP(selectedAgent.commission)}</span>`;

if (!content.includes(oldComm)) {
  console.error("Could not find oldComm");
  process.exit(1);
}
content = content.replace(oldComm, newComm);

// 4. Replace average deal value:
const oldAvg = `                                <div className="text-xs text-slate-400 mt-1">Valor Promedio de Venta: \${((selectedAgent.actual / selectedAgent.deals) || 0).toLocaleString('es-CO', {maximumFractionDigits: 0})} COP</div>`;
const newAvg = `                                <div className="text-xs text-slate-400 mt-1">Valor Promedio de Venta: {formatCOP((selectedAgent.actual / selectedAgent.deals) || 0)}</div>`;

if (!content.includes(oldAvg)) {
  console.error("Could not find oldAvg");
  process.exit(1);
}
content = content.replace(oldAvg, newAvg);

if (hasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully formatted currency in SalesTeamProfiles.tsx!");
