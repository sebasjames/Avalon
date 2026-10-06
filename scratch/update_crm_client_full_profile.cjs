const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'CrmClientFullProfile.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const hasCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Update imports
const oldImports = `import { ArrowLeft, Mail, Phone, MapPin, Globe, Calendar, Clock, DollarSign, Target, Activity, FileText, CheckCircle, Search, Eye, TrendingUp, TrendingDown, Briefcase, BarChart2, Star, Users, AlertTriangle } from 'lucide-react';`;
const newImports = `import { ArrowLeft, Mail, Phone, MapPin, Globe, Calendar, Clock, DollarSign, Target, Activity, FileText, CheckCircle, Search, Eye, TrendingUp, TrendingDown, Briefcase, BarChart2, Star, Users, AlertTriangle, ShoppingBag, Receipt, CreditCard, ExternalLink, Truck, CheckCircle2 } from 'lucide-react';`;

if (!content.includes(oldImports)) {
  console.error("Could not find oldImports");
  process.exit(1);
}
content = content.replace(oldImports, newImports);

// 2. Update context destructuring
const oldContext = `const { contacts, deals, activities, systemUsers, assignmentLogs, getContactHealthScore, taxRules, pricingRules, paymentRules } = useEnterprise();`;
const newContext = `const { contacts, deals, activities, systemUsers, assignmentLogs, getContactHealthScore, taxRules, pricingRules, paymentRules, transactions, dispatches } = useEnterprise();`;

if (!content.includes(oldContext)) {
  console.error("Could not find oldContext");
  process.exit(1);
}
content = content.replace(oldContext, newContext);

// 3. Add client transactions calculations right before return
const oldCalculations = `  const isCreditBlocked = contact.creditLimit && contact.creditLimitUsed && contact.creditLimitUsed >= contact.creditLimit;
  const isOverdueBlocked = contact.hasOverdueBills;
  const isBlocked = isCreditBlocked || isOverdueBlocked;
  const blockedReason = isCreditBlocked ? 'Límite de crédito excedido' : 'Facturas en mora';`;

const newCalculations = `  const isCreditBlocked = contact.creditLimit && contact.creditLimitUsed && contact.creditLimitUsed >= contact.creditLimit;
  const isOverdueBlocked = contact.hasOverdueBills;
  const isBlocked = isCreditBlocked || isOverdueBlocked;
  const blockedReason = isCreditBlocked ? 'Límite de crédito excedido' : 'Facturas en mora';

  // Historial de Órdenes y Facturas
  const clientTransactions = (transactions || []).filter(t => {
    if (t.clientId && t.clientId === contact.id) return true;
    const cCompany = (contact.company || '').trim().toLowerCase();
    const cName = (contact.name || '').trim().toLowerCase();
    const tClient = (t.client || '').trim().toLowerCase();
    if (cCompany && (tClient === cCompany || tClient.includes(cCompany) || cCompany.includes(tClient))) return true;
    if (cName && (tClient === cName || tClient.includes(cName) || cName.includes(tClient))) return true;
    if (contact.documentNumber && t.document && t.document.includes(contact.documentNumber)) return true;
    return false;
  });

  const clientDispatches = (dispatches || []).filter(d => {
    if (d.contactId === contact.id) return true;
    if (contactDeals.some(deal => deal.id === d.dealId)) return true;
    return false;
  });

  const totalInvoicedTxs = clientTransactions
    .filter(t => t.type === 'VENTA')
    .reduce((sum, t) => sum + (t.total || 0), 0) || totalWon;

  const totalPendingBalance = clientTransactions
    .reduce((sum, t) => sum + (t.balance ?? (t.paymentStatus === 'PENDIENTE' ? t.total : 0)), 0);

  const unpaidTransactionsCount = clientTransactions.filter(
    t => t.paymentStatus === 'PENDIENTE' || t.paymentStatus === 'EN_MORA' || (t.balance && t.balance > 0)
  ).length;`;

if (!content.includes(oldCalculations)) {
  console.error("Could not find oldCalculations");
  process.exit(1);
}
content = content.replace(oldCalculations, newCalculations);

// 4. Insert Orders & Invoices card before {/* PIPELINE DEALS */}
const oldPipelineDeals = `                    {/* PIPELINE DEALS */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">`;

const newOrdersCard = `                    {/* HISTORIAL DE ÓRDENES Y FACTURAS */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-indigo-600" />
                          <h3 className="font-bold text-slate-800">
                            Historial de Órdenes & Facturas de Venta
                          </h3>
                          <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                            {clientTransactions.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.location.hash = '#/accounting/sabana'}
                            className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5 text-slate-500" /> Ver Sábana Contable
                          </button>
                          <button
                            onClick={() => window.location.hash = '#/pos'}
                            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors shadow-xs"
                          >
                            + Facturar en POS
                          </button>
                        </div>
                      </div>

                      {/* Micro KPI Bar */}
                      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50 border-b border-slate-100 py-2.5 px-5 text-center text-xs">
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Total Facturado</span>
                          <span className="font-black text-slate-900">\${totalInvoicedTxs.toLocaleString('es-CO')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Saldo en Cartera</span>
                          <span className={\`font-black \${totalPendingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}\`}>
                            \${totalPendingBalance.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Facturas Pendientes</span>
                          <span className={\`font-black \${unpaidTransactionsCount > 0 ? 'text-amber-700' : 'text-slate-700'}\`}>
                            {unpaidTransactionsCount}
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto custom-scrollbar">
                        {clientTransactions.length > 0 ? (
                          clientTransactions.map(tx => {
                            const hasOverdue = tx.paymentStatus === 'EN_MORA' || (tx.dueDate && new Date(tx.dueDate) < new Date() && tx.paymentStatus !== 'PAGADA');
                            return (
                              <div key={tx.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      {tx.document || tx.id}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">{tx.date}</span>
                                    <span className={\`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border \${
                                      tx.paymentStatus === 'PAGADA'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : hasOverdue
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }\`}>
                                      {tx.paymentStatus === 'PAGADA' ? 'Pagada ✓' : hasOverdue ? 'En Mora ⚠️' : 'Pendiente'}
                                    </span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-800">{tx.productName} <span className="text-xs font-normal text-slate-500">x{tx.qty}</span></p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>Medio: <strong className="text-slate-700">{tx.paymentMethod || 'Contado'}</strong></span>
                                    {tx.posLocation && <span>• Sede: {tx.posLocation}</span>}
                                    {tx.dueDate && tx.paymentStatus !== 'PAGADA' && (
                                      <span className="text-amber-700 font-semibold">• Vence: {tx.dueDate}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-lg font-black text-slate-900">\${tx.total.toLocaleString('es-CO')}</p>
                                  {tx.balance !== undefined && tx.balance > 0 && (
                                    <p className="text-xs font-bold text-amber-700">Saldo: \${tx.balance.toLocaleString('es-CO')}</p>
                                  )}
                                  <button
                                    onClick={() => window.location.hash = '#/accounting/sabana'}
                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline mt-1 inline-flex items-center gap-0.5"
                                  >
                                    Ver detalle <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-slate-500 italic">
                            <p>No hay facturas registradas en el libro contable para este cliente.</p>
                            {contactDeals.filter(d => d.stage === 'CLOSED_WON').length > 0 && (
                              <p className="text-xs text-indigo-600 font-semibold mt-1">
                                (Tiene {contactDeals.filter(d => d.stage === 'CLOSED_WON').length} trato(s) cerrado(s) ganado(s) en CRM listados abajo)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PIPELINE DEALS */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">`;

if (!content.includes(oldPipelineDeals)) {
  console.error("Could not find oldPipelineDeals");
  process.exit(1);
}
content = content.replace(oldPipelineDeals, newOrdersCard);

if (hasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated CrmClientFullProfile.tsx!");
