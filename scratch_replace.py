import sys
import os

path = r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\CrmDealCreateModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Valor Esperado ($)</label>
              <input 
                type="number" 
                required
                min="0"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none" 
              />
            </div>"""

replacement = """            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <label className="text-sm font-bold text-slate-800 block">Cotizador de Productos (Opcional)</label>
              
              <div className="flex gap-2">
                <select 
                  value={selectedProduct} 
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="flex-1 text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 ring-indigo-500/20"
                >
                  <option value="">Seleccionar Producto...</option>
                  {inventory.filter(p => p.status !== 'SILENT').map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price.toLocaleString('es-CO')}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  min="1" 
                  placeholder="Cant" 
                  value={selectedQuantity}
                  onChange={e => setSelectedQuantity(Number(e.target.value))}
                  className="w-20 text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 ring-indigo-500/20"
                />
                <button 
                  type="button" 
                  onClick={handleAddItem}
                  className="px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-lg transition-colors"
                >
                  +
                </button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded shadow-sm text-xs">
                      <div>
                        <span className="font-bold text-slate-700">{item.quantity}x</span> {item.name}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-500">${(item.quantity * item.unitPrice).toLocaleString('es-CO')}</span>
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-700">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block flex justify-between">
                <span>Valor Esperado ($)</span>
                {items.length > 0 && <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1 rounded border border-indigo-100">Calculado</span>}
              </label>
              <input 
                type="number" 
                required
                min="0"
                value={items.length > 0 ? items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) : value}
                onChange={(e) => { if(items.length === 0) setValue(Number(e.target.value)) }}
                disabled={items.length > 0}
                className={`w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none ${items.length > 0 ? 'bg-slate-100 font-bold text-slate-600' : ''}`} 
              />
            </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced successfully')
else:
    print('Target not found')
