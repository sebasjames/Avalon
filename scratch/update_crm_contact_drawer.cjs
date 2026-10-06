const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'CrmContactDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings for reliable string matching
const hasCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Update imports
const oldImports = `import { X, Mail, Phone, Users, Plus, Calendar, Clock, Send, Paperclip, FileText, Download, UploadCloud, Trophy, CheckCircle2, TrendingUp, BarChart2, Eye, Tags, LineChart, BarChart, ChevronDown, ChevronRight, Briefcase } from 'lucide-react';`;
const newImports = `import { X, Mail, Phone, Users, Plus, Calendar, Clock, Send, Paperclip, FileText, Download, UploadCloud, Trophy, CheckCircle2, TrendingUp, BarChart2, Eye, Tags, LineChart, BarChart, ChevronDown, ChevronRight, Briefcase, ShoppingBag, Receipt, Truck, CreditCard, AlertCircle, ExternalLink, Filter, User, PackageCheck } from 'lucide-react';`;

if (!content.includes(oldImports)) {
  console.error("Could not find oldImports");
  process.exit(1);
}
content = content.replace(oldImports, newImports);

// 2. Update context destructuring and add state / calculations
const oldEnterprise = `const { setFullProfileContactId, taxRules, pricingRules, paymentRules, updateContact, updateDeal, systemUsers } = useEnterprise();`;
const newEnterprise = `const { setFullProfileContactId, taxRules, pricingRules, paymentRules, updateContact, updateDeal, systemUsers, transactions, dispatches } = useEnterprise();

  const [drawerActiveTab, setDrawerActiveTab] = useState<'profile' | 'orders'>('profile');
  const [ordersFilter, setOrdersFilter] = useState<'ALL' | 'UNPAID' | 'DISPATCHES'>('ALL');
  const [ordersSearch, setOrdersSearch] = useState('');

  // Historial de Órdenes y Transacciones del Cliente
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

  const wonDeals = contactDeals.filter(d => d.stage === 'CLOSED_WON');

  const totalInvoiced = clientTransactions
    .filter(t => t.type === 'VENTA')
    .reduce((acc, t) => acc + (t.total || 0), 0) || (wonDeals.reduce((acc, d) => acc + d.value, 0));

  const totalPendingBalance = clientTransactions
    .reduce((acc, t) => acc + (t.balance ?? (t.paymentStatus === 'PENDIENTE' ? t.total : 0)), 0);

  const unpaidTransactions = clientTransactions.filter(
    t => t.paymentStatus === 'PENDIENTE' || t.paymentStatus === 'EN_MORA' || (t.balance && t.balance > 0)
  );

  const filteredTransactions = clientTransactions.filter(t => {
    if (ordersFilter === 'UNPAID') {
      const isUnpaid = t.paymentStatus === 'PENDIENTE' || t.paymentStatus === 'EN_MORA' || (t.balance && t.balance > 0);
      if (!isUnpaid) return false;
    }
    if (ordersSearch.trim()) {
      const q = ordersSearch.toLowerCase();
      const matchDoc = t.document?.toLowerCase().includes(q);
      const matchProd = t.productName?.toLowerCase().includes(q);
      const matchMethod = t.paymentMethod?.toLowerCase().includes(q);
      return matchDoc || matchProd || matchMethod;
    }
    return true;
  });`;

if (!content.includes(oldEnterprise)) {
  console.error("Could not find oldEnterprise");
  process.exit(1);
}
content = content.replace(oldEnterprise, newEnterprise);

// 3. Update drawer width from max-w-md to max-w-xl
const oldDrawerDiv = `      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col relative z-10 border-l border-slate-200"
      >`;

const newDrawerDiv = `      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col relative z-10 border-l border-slate-200"
      >`;

if (!content.includes(oldDrawerDiv)) {
  console.error("Could not find oldDrawerDiv");
  process.exit(1);
}
content = content.replace(oldDrawerDiv, newDrawerDiv);

// 4. Insert Navigation Tabs right below the header </div> (before <div className="flex-1 overflow-y-auto...)
const oldHeaderClose = `            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">`;

const newHeaderClose = `            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setDrawerActiveTab('profile')}
            className={\`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 \${
              drawerActiveTab === 'profile'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }\`}
          >
            <User className="w-3.5 h-3.5" />
            Ficha del Contacto
          </button>
          <button
            type="button"
            onClick={() => setDrawerActiveTab('orders')}
            className={\`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 \${
              drawerActiveTab === 'orders'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }\`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Órdenes & Facturas
            <span className={\`px-2 py-0.5 rounded-full text-[10px] font-black \${
              clientTransactions.length > 0 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-slate-200 text-slate-600'
            }\`}>
              {clientTransactions.length}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {drawerActiveTab === 'profile' ? (
            <>`;

if (!content.includes(oldHeaderClose)) {
  console.error("Could not find oldHeaderClose");
  process.exit(1);
}
content = content.replace(oldHeaderClose, newHeaderClose);

// 5. Close profile tab and add orders tab before </motion.div>
const oldFooter = `                  </select>
                </div>
              </div>
            )}
          </section>
        </div>
      </motion.div>`;

const newOrdersTabUI = `                  </select>
                </div>
              </div>
            )}
          </section>
            </>
          ) : (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-xl border border-indigo-100 shadow-xs">
                  <div className="flex items-center justify-between text-indigo-600 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Total Facturado</span>
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-slate-900 tracking-tight">
                    \${totalInvoiced.toLocaleString('es-CO')}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {clientTransactions.length} documento{clientTransactions.length === 1 ? '' : 's'}
                  </p>
                </div>

                <div className={\`p-4 rounded-xl border shadow-xs \${
                  totalPendingBalance > 0
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }\`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {totalPendingBalance > 0 ? 'Saldo en Cartera' : 'Cartera'}
                    </span>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black tracking-tight">
                    \${totalPendingBalance.toLocaleString('es-CO')}
                  </div>
                  <span className={\`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 \${
                    totalPendingBalance > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }\`}>
                    {totalPendingBalance > 0 ? \`\${unpaidTransactions.length} pendiente(s)\` : 'Al día ✓'}
                  </span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOrdersFilter('ALL')}
                  className={\`flex-1 py-1.5 text-xs font-bold rounded-md transition-all \${
                    ordersFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }\`}
                >
                  Todas ({clientTransactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersFilter('UNPAID')}
                  className={\`flex-1 py-1.5 text-xs font-bold rounded-md transition-all \${
                    ordersFilter === 'UNPAID'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }\`}
                >
                  Por Cobrar ({unpaidTransactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersFilter('DISPATCHES')}
                  className={\`flex-1 py-1.5 text-xs font-bold rounded-md transition-all \${
                    ordersFilter === 'DISPATCHES'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }\`}
                >
                  Despachos ({clientDispatches.length})
                </button>
              </div>

              {/* Search Box */}
              {ordersFilter !== 'DISPATCHES' && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar factura o producto..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                  <Receipt className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              )}

              {/* Content List */}
              {ordersFilter === 'DISPATCHES' ? (
                <div className="space-y-3">
                  {clientDispatches.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6">
                      <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">No hay despachos logísticos activos</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Las órdenes despachadas hacia este cliente aparecerán aquí con seguimiento en tiempo real.
                      </p>
                      <button
                        onClick={() => { onClose(); window.location.hash = '#/despachos'; }}
                        className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                      >
                        Ir al Módulo de Despachos <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    clientDispatches.map((disp) => (
                      <div key={disp.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-indigo-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {disp.id}
                          </span>
                          <span className={\`text-[10px] font-black uppercase px-2 py-0.5 rounded-full \${
                            disp.status === 'ENTREGADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : disp.status === 'EN_TRANSITO'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }\`}>
                            {disp.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 font-medium mb-2">
                          <p><span className="text-slate-400 font-bold">Fecha Prometida:</span> {disp.promisedDate}</p>
                          {disp.driver && <p><span className="text-slate-400 font-bold">Conductor:</span> {disp.driver} {disp.vehicle ? \`(\${disp.vehicle})\` : ''}</p>}
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-600 border border-slate-100">
                          <span className="font-bold text-slate-500 block mb-1">Ítems a Entregar:</span>
                          {disp.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between py-0.5">
                              <span>{it.productName}</span>
                              <span className="font-bold">{it.deliveredQty} / {it.orderedQty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6">
                      <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">Sin facturas o transacciones registradas</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        No hay facturas registradas en Sábana Contable para {contact.company || contact.name}.
                      </p>
                      {wonDeals.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 text-left">
                          <p className="text-xs font-bold text-slate-700 mb-2">Tratos Ganados en CRM ({wonDeals.length}):</p>
                          {wonDeals.map(d => (
                            <div key={d.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs mb-1.5 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-800">{d.title}</p>
                                <span className="text-[10px] text-emerald-600 font-bold uppercase">Cerrado Ganado</span>
                              </div>
                              <span className="font-black text-slate-900">\${d.value.toLocaleString('es-CO')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          onClick={() => { onClose(); window.location.hash = '#/pos'; }}
                          className="bg-indigo-600 text-white font-bold text-xs py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                        >
                          + Generar Factura en POS
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const hasOverdue = tx.paymentStatus === 'EN_MORA' || (tx.dueDate && new Date(tx.dueDate) < new Date() && tx.paymentStatus !== 'PAGADA');
                      return (
                        <div
                          key={tx.id}
                          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3.5 shadow-xs transition-all hover:shadow-sm"
                        >
                          {/* Header row */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {tx.document || tx.id}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {tx.date}
                              </span>
                            </div>
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

                          {/* Product & Qty */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1">{tx.productName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-500 font-medium">Cant: {tx.qty} {tx.sku && tx.sku !== '-' ? \`• \${tx.sku}\` : ''}</span>
                                {tx.posLocation && (
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                                    {tx.posLocation}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-black text-slate-900 block">
                                \${tx.total.toLocaleString('es-CO')}
                              </span>
                              {tx.balance !== undefined && tx.balance > 0 && (
                                <span className="text-[10px] font-bold text-amber-700 block">
                                  Saldo: \${tx.balance.toLocaleString('es-CO')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Footer tags & links */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              <span>{tx.paymentMethod || 'Contado'}</span>
                              {tx.dueDate && tx.paymentStatus !== 'PAGADA' && (
                                <span className="text-amber-700 font-bold ml-1">Vence: {tx.dueDate}</span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                onClose();
                                window.location.hash = '#/accounting/sabana';
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 hover:underline"
                            >
                              Ver en Sábana <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Bottom shortcut to POS */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">¿Nuevo pedido comercial?</span>
                <button
                  onClick={() => {
                    onClose();
                    window.location.hash = '#/pos';
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Ir a Caja / POS <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>`;

if (!content.includes(oldFooter)) {
  console.error("Could not find oldFooter");
  process.exit(1);
}
content = content.replace(oldFooter, newOrdersTabUI);

if (hasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated CrmContactDrawer.tsx!");
