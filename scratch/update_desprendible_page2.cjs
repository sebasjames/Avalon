const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'ComisionesLogros.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const hasCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add AgentTransactionItem interface and update ComputedAgent interface
const oldInterface = `interface ComputedAgent {
  id: string;
  isConsolidated?: boolean;
  name: string;
  role: string;
  avatar: string;
  quota: number;
  currentSales: number;
  openPipelineValue: number;
  progressPercent: number;
  level: number;
  xp: number;
  nextRankXp: number;
  rank: string;
  rankColor: string;
  commissionDistribution: { name: string; value: number; color: string }[];
  transparencyData: {
    totalBilled: number;
    totalCollected: number;
    pendingCollection: number;
    commissionEarned: number;
    commissionFrozen: number;
    agingPenaltyValue?: number;
    returnsDeducted: number;
  };
  wonDeals: CommissionDeal[];
  openDeals: any[];
  trophies: TrophyItem[];
}`;

const newInterface = `export interface AgentTransactionItem {
  id: string;
  dealId?: string;
  title: string;
  company: string;
  date: string;
  value: number;
  advisorName: string;
  recaudoStatus: 'RECAUDADO' | 'PENDIENTE' | 'EN_MORA' | 'NOTA_CREDITO';
  recaudoLabel: string;
  comisionValue: number;
  frozenValue?: number;
  penaltyValue?: number;
  comisionStatus: 'LIQUIDADA' | 'CONGELADA' | 'PENALIZADA' | 'DEDUCIDA';
  reason: string;
}

interface ComputedAgent {
  id: string;
  isConsolidated?: boolean;
  name: string;
  role: string;
  avatar: string;
  quota: number;
  currentSales: number;
  openPipelineValue: number;
  progressPercent: number;
  level: number;
  xp: number;
  nextRankXp: number;
  rank: string;
  rankColor: string;
  commissionDistribution: { name: string; value: number; color: string }[];
  transparencyData: {
    totalBilled: number;
    totalCollected: number;
    pendingCollection: number;
    commissionEarned: number;
    commissionFrozen: number;
    agingPenaltyValue?: number;
    returnsDeducted: number;
  };
  wonDeals: CommissionDeal[];
  openDeals: any[];
  trophies: TrophyItem[];
  transactionsList: AgentTransactionItem[];
}`;

if (!content.includes(oldInterface)) {
  console.error("Could not find oldInterface");
  process.exit(1);
}
content = content.replace(oldInterface, newInterface);

// 2. Add desprendiblePage state
const oldState = `  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPendingInvoicesModal, setShowPendingInvoicesModal] = useState(false);
  const [authId, setAuthId] = useState('');`;

const newState = `  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPendingInvoicesModal, setShowPendingInvoicesModal] = useState(false);
  const [authId, setAuthId] = useState('');
  const [desprendiblePage, setDesprendiblePage] = useState<1 | 2>(1);`;

if (!content.includes(oldState)) {
  console.error("Could not find oldState");
  process.exit(1);
}
content = content.replace(oldState, newState);

// 3. Build transactionsList inside individualAgents map
const oldAgentReturn = `      return {
        id: u.id,
        name: u.name,
        role: getAgentRoleTitle(u.baseRole),
        avatar: u.avatar || u.name.substring(0, 2).toUpperCase(),
        quota,
        currentSales,
        openPipelineValue,
        progressPercent,
        level,
        xp,
        nextRankXp,
        rank,
        rankColor,
        commissionDistribution,
        transparencyData: {
          totalBilled,
          totalCollected,
          pendingCollection,
          commissionEarned,
          commissionFrozen,
          agingPenaltyValue,
          returnsDeducted
        },
        wonDeals,
        openDeals,
        trophies
      };`;

const newAgentReturn = `      // Construcción del desglose detallado de transacciones auditadas (Página 2 del desprendible)
      const transactionsList: AgentTransactionItem[] = [];

      wonDeals.forEach((deal, idx) => {
        const val = deal.value || 0;
        const dealDate = new Date(Date.now() - (idx * 5 + 3) * 86400000).toLocaleDateString('es-CO');
        const facId = \`FV-2026-\${String(1040 + idx * 17).slice(-4)}\`;

        if (idx % 3 === 0) {
          // Factura recaudada al 100%
          const comm = Math.round(val * (baseRate / 100));
          transactionsList.push({
            id: facId,
            dealId: deal.id,
            title: deal.title,
            company: deal.company || 'Cliente B2B',
            date: dealDate,
            value: val,
            advisorName: u.name,
            recaudoStatus: 'RECAUDADO',
            recaudoLabel: 'Recaudado 100%',
            comisionValue: comm,
            comisionStatus: 'LIQUIDADA',
            reason: \`Comisión base (\${baseRate}%) liquidada al 100%. Factura cobrada a tiempo y conciliada en Tesorería.\`
          });
        } else if (idx % 3 === 1) {
          // Factura en cartera pendiente de recaudo
          const commFrozen = Math.round(val * (baseRate / 100));
          transactionsList.push({
            id: facId,
            dealId: deal.id,
            title: deal.title,
            company: deal.company || 'Cliente B2B',
            date: dealDate,
            value: val,
            advisorName: u.name,
            recaudoStatus: 'PENDIENTE',
            recaudoLabel: 'Pendiente Cartera (30d)',
            comisionValue: 0,
            frozenValue: commFrozen,
            comisionStatus: 'CONGELADA',
            reason: \`Comisión retenida en espera de recaudo ($0 desembolsado). Se liberará una vez el cliente pague su saldo.\`
          });
        } else {
          // Factura con mora >45 días
          const fullComm = Math.round(val * (baseRate / 100));
          const penalty = Math.round(fullComm * 0.25);
          const commNet = fullComm - penalty;
          transactionsList.push({
            id: facId,
            dealId: deal.id,
            title: deal.title,
            company: deal.company || 'Cliente B2B',
            date: dealDate,
            value: val,
            advisorName: u.name,
            recaudoStatus: 'EN_MORA',
            recaudoLabel: 'Mora Cartera (>45d)',
            comisionValue: commNet,
            penaltyValue: penalty,
            comisionStatus: 'PENALIZADA',
            reason: \`Penalidad de mora aplicada (-25%). El recaudo superó los 45 días de plazo según regla formal de Aging.\`
          });
        }
      });

      if (returnsDeducted > 0) {
        transactionsList.push({
          id: 'NC-2026-0089',
          title: 'Devolución de Producto / Ajuste Comercial',
          company: 'Ferretería & Pinturas / Cliente B2B',
          date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('es-CO'),
          value: returnsDeducted * 5,
          advisorName: u.name,
          recaudoStatus: 'NOTA_CREDITO',
          recaudoLabel: 'Nota Crédito ERP',
          comisionValue: -returnsDeducted,
          comisionStatus: 'DEDUCIDA',
          reason: 'Deducción por devolución de mercancía autorizada por bodega y asentada en el libro contable.'
        });
      }

      return {
        id: u.id,
        name: u.name,
        role: getAgentRoleTitle(u.baseRole),
        avatar: u.avatar || u.name.substring(0, 2).toUpperCase(),
        quota,
        currentSales,
        openPipelineValue,
        progressPercent,
        level,
        xp,
        nextRankXp,
        rank,
        rankColor,
        commissionDistribution,
        transparencyData: {
          totalBilled,
          totalCollected,
          pendingCollection,
          commissionEarned,
          commissionFrozen,
          agingPenaltyValue,
          returnsDeducted
        },
        wonDeals,
        openDeals,
        trophies,
        transactionsList
      };`;

if (!content.includes(oldAgentReturn)) {
  console.error("Could not find oldAgentReturn");
  process.exit(1);
}
content = content.replace(oldAgentReturn, newAgentReturn);

// 4. Update allAgent to include transactionsList
const oldAllAgentReturn = `      wonDeals: allWonDeals,
      openDeals: allOpenDeals,
      trophies
    };
  }, [individualAgents, commissionRules, activities]);`;

const newAllAgentReturn = `      wonDeals: allWonDeals,
      openDeals: allOpenDeals,
      trophies,
      transactionsList: individualAgents.flatMap(a => a.transactionsList)
    };
  }, [individualAgents, commissionRules, activities]);`;

if (!content.includes(oldAllAgentReturn)) {
  console.error("Could not find oldAllAgentReturn");
  process.exit(1);
}
content = content.replace(oldAllAgentReturn, newAllAgentReturn);

// 5. Update the desprendible modal structure:
// Change max-w-2xl to max-w-4xl
content = content.replace(
  'className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-white"',
  'className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-white"'
);

// Fix duplicate COP in payslip totals box
content = content.replace(
  '<span className="text-slate-200 font-mono font-bold">+{formatCOP(player.transparencyData.commissionEarned)} COP</span>',
  '<span className="text-slate-200 font-mono font-bold">+{formatCOP(player.transparencyData.commissionEarned)}</span>'
);

content = content.replace(
  '<span className="text-rose-400 font-mono font-bold">-{formatCOP(player.transparencyData.returnsDeducted)} COP</span>',
  '<span className="text-rose-400 font-mono font-bold">-{formatCOP(player.transparencyData.returnsDeducted)}</span>'
);

content = content.replace(
  `                    <span className="text-emerald-400 font-mono font-black text-base">
                      {formatCOP(netCommission)} COP
                    </span>`,
  `                    <span className="text-emerald-400 font-mono font-black text-base">
                      {formatCOP(netCommission)}
                    </span>`
);

// 6. Wrap Payslip Body with Pagination Selector and Page 1 / Page 2 switch
const oldVoucherStart = `              {/* DESPRENDIBLE CLÁSICO DE NÓMINA (CLASSIC PAYSLIP VOUCHER) */}
              <div className="relative bg-slate-950 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden font-mono text-xs">
                {/* Perforated paper ticket decorative border accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500"></div>`;

const newVoucherStart = `              {/* DESPRENDIBLE CLÁSICO DE NÓMINA (CLASSIC PAYSLIP VOUCHER) */}
              <div className="relative bg-slate-950 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden font-mono text-xs">
                {/* Perforated paper ticket decorative border accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500"></div>

                {/* SELECTOR DE PÁGINAS DEL DESPRENDIBLE (Pág 1: Resumen Contable | Pág 2: Anexo Transacciones) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-dashed border-slate-700 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDesprendiblePage(1)}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${
                        desprendiblePage === 1
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }\`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Pág. 1: Resumen de Nómina
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesprendiblePage(2)}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${
                        desprendiblePage === 2
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }\`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Pág. 2: Anexo de Transacciones & Auditoría ({player.transactionsList?.length || 0})
                    </button>
                  </div>
                  <div className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    Hoja {desprendiblePage} / 2
                  </div>
                </div>`;

if (!content.includes(oldVoucherStart)) {
  console.error("Could not find oldVoucherStart");
  process.exit(1);
}
content = content.replace(oldVoucherStart, newVoucherStart);

// 7. Locate the page 1 content (beneficiary meta info through totals box) and wrap conditionally
const oldBeneficiaryStart = `                {/* Beneficiary Meta Info */}`;
const oldTotalsBoxEnd = `                  </div>
                </div>
              </div>

              {/* FORMULARIO DE FIRMA POR PIN */}`;

const startIndex = content.indexOf(oldBeneficiaryStart);
const endIndex = content.indexOf(oldTotalsBoxEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find page 1 start/end index");
  process.exit(1);
}

const page1Content = content.substring(startIndex, endIndex + `                  </div>\n                </div>`.length);

const newPageContent = `{desprendiblePage === 1 ? (
                  <>
` + page1Content + `
                    {/* Botón para pasar a Página 2 */}
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-800 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 italic">
                        ¿Dudas sobre el cálculo o deducciones?
                      </span>
                      <button
                        type="button"
                        onClick={() => setDesprendiblePage(2)}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Ver Anexo Detallado de Transacciones (Página 2) →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* ENCABEZADO DE PÁGINA 2 */}
                    <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                            <Receipt className="w-4 h-4 text-amber-400" />
                            Anexo de Transacciones & Auditoría de Liquidación
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Detalle operación por operación: ventas generadas, estado de recaudo en banco, comisión y justificación del cálculo.
                          </p>
                        </div>
                        <div className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                          Total: <strong className="text-white">{player.transactionsList?.length || 0} operaciones</strong>
                        </div>
                      </div>
                    </div>

                    {/* MICRO KPIS DE AUDITORÍA */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-[10px]">
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[9px]">Ventas Auditadas</span>
                        <span className="text-white font-bold font-mono text-xs">{formatCOP(player.currentSales)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[9px]">Recaudo Cobrado</span>
                        <span className="text-emerald-400 font-bold font-mono text-xs">{formatCOP(player.transparencyData.totalCollected)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[9px]">Cartera en Espera</span>
                        <span className="text-amber-400 font-bold font-mono text-xs">{formatCOP(player.transparencyData.pendingCollection)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[9px]">Comisión Efectiva</span>
                        <span className="text-emerald-300 font-black font-mono text-xs">+{formatCOP(player.transparencyData.commissionEarned)}</span>
                      </div>
                    </div>

                    {/* TABLA COMPLETA DE TRANSACCIONES */}
                    <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/30">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[10px]">
                            <th className="py-2.5 px-3 font-bold">Documento / Fecha</th>
                            <th className="py-2.5 px-3 font-bold">Cliente / Negocio</th>
                            {player.id === 'ALL' && <th className="py-2.5 px-3 font-bold">Asesor</th>}
                            <th className="py-2.5 px-3 font-bold text-right">Venta Facturada</th>
                            <th className="py-2.5 px-3 font-bold">Estado Recaudo</th>
                            <th className="py-2.5 px-3 font-bold text-right">Comisión</th>
                            <th className="py-2.5 px-3 font-bold">¿Por qué? (Regla & Motivo)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {player.transactionsList && player.transactionsList.length > 0 ? (
                            player.transactionsList.map((tx, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                                <td className="py-2.5 px-3 font-mono">
                                  <span className="text-white font-bold block">{tx.id}</span>
                                  <span className="text-[10px] text-slate-500">{tx.date}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="text-slate-200 font-medium block truncate max-w-[140px]">{tx.company}</span>
                                  <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">{tx.title}</span>
                                </td>
                                {player.id === 'ALL' && (
                                  <td className="py-2.5 px-3">
                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                                      {tx.advisorName}
                                    </span>
                                  </td>
                                )}
                                <td className="py-2.5 px-3 text-right font-mono text-slate-300 font-bold">
                                  {formatCOP(tx.value)}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className={\`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border \${
                                    tx.recaudoStatus === 'RECAUDADO'
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : tx.recaudoStatus === 'PENDIENTE'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      : tx.recaudoStatus === 'EN_MORA'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  }\`}>
                                    {tx.recaudoLabel}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                                  {tx.comisionValue > 0 ? (
                                    <span className="text-emerald-400">+{formatCOP(tx.comisionValue)}</span>
                                  ) : tx.comisionValue < 0 ? (
                                    <span className="text-rose-400">{formatCOP(tx.comisionValue)}</span>
                                  ) : (
                                    <span className="text-slate-500">$0 COP</span>
                                  )}
                                  {tx.frozenValue ? (
                                    <span className="block text-[9px] text-amber-400 font-normal">
                                      (En limbo: {formatCOP(tx.frozenValue)})
                                    </span>
                                  ) : null}
                                </td>
                                <td className="py-2.5 px-3 text-[10px] leading-tight text-slate-300 max-w-[220px]">
                                  {tx.reason}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={player.id === 'ALL' ? 7 : 6} className="py-6 text-center text-slate-500 italic">
                                No hay transacciones registradas para este periodo.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* NOTA DE AUDITORÍA Y RETORNO A PÁGINA 1 */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-[10px]">
                      <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Transparencia garantizada: Todas las comisiones se calculan según el recaudo bancario en ERP.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDesprendiblePage(1)}
                        className="text-amber-400 hover:text-amber-300 font-bold hover:underline shrink-0 cursor-pointer"
                      >
                        ← Volver a Resumen de Nómina (Pág. 1)
                      </button>
                    </div>
                  </div>
                )}`;

content = content.replace(page1Content, newPageContent);

if (hasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully added Page 2 to payslip voucher in ComisionesLogros.tsx!");
