import sys
import re

# 1. Update EnterpriseContext
with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\context\EnterpriseContext.tsx', 'r', encoding='utf-8') as f:
    ectx = f.read()

if 'mezclaOrders: MezclaOrder[]' not in ectx:
    # Add to Type
    ectx = ectx.replace('export interface EnterpriseContextType {', "import { MezclaOrder, MezclaStatus } from '../types';\n\nexport interface EnterpriseContextType {\n    mezclaOrders: MezclaOrder[];\n    addMezclaOrder: (m: MezclaOrder) => void;\n    updateMezclaOrder: (id: string, updates: Partial<MezclaOrder>) => void;")
    
    # Add to Provider State
    ectx = ectx.replace('const [locations, setLocations]', 'const [mezclaOrders, setMezclaOrders] = useState<MezclaOrder[]>([]);\n    const [locations, setLocations]')
    
    # Add functions
    funcs = """
    const addMezclaOrder = (m: MezclaOrder) => setMezclaOrders(prev => [...prev, m]);
    const updateMezclaOrder = (id: string, updates: Partial<MezclaOrder>) => {
        setMezclaOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    };
    """
    ectx = ectx.replace('const addLocation =', funcs + '\n    const addLocation =')
    
    # Add to Provider Value
    ectx = ectx.replace('getCompleteState,', 'mezclaOrders, addMezclaOrder, updateMezclaOrder,\n            getCompleteState,')
    
    # Add to localStorage save/restore
    ectx = ectx.replace('if (parsed.locations)', 'if (parsed.mezclaOrders) setMezclaOrders(parsed.mezclaOrders);\n                    if (parsed.locations)')
    ectx = ectx.replace('locations, worldOfficeConfig', 'mezclaOrders, locations, worldOfficeConfig')

    with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\context\EnterpriseContext.tsx', 'w', encoding='utf-8') as f:
        f.write(ectx)
    print("Updated EnterpriseContext")

# 2. Update MezclasTablero
with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\MezclasTablero.tsx', 'r', encoding='utf-8') as f:
    mt = f.read()

if 'const { mezclaOrders, updateMezclaOrder,' not in mt:
    mt = mt.replace('const { addKardexTransaction, updateInventoryStock } = useEnterprise();', 'const { addKardexTransaction, updateInventoryStock, mezclaOrders, updateMezclaOrder } = useEnterprise();')
    mt = mt.replace('const [orders, setOrders] = useState<MezclaOrder[]>(MOCK_ORDERS);', 'const orders = mezclaOrders;')
    
    # Update updateStatus logic
    old_update_status = """setOrders(prev => prev.map(o => {
            if (o.id === id) {
                return {
                    ...o, 
                    status: newStatus,
                    completedAt: newStatus === MezclaStatus.READY ? new Date().toISOString() : o.completedAt
                };
            }
            return o;
        }));"""
    
    new_update_status = """updateMezclaOrder(id, {
            status: newStatus,
            completedAt: newStatus === MezclaStatus.READY ? new Date().toISOString() : orderToUpdate?.completedAt
        });"""
        
    mt = mt.replace(old_update_status, new_update_status)
    with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\MezclasTablero.tsx', 'w', encoding='utf-8') as f:
        f.write(mt)
    print("Updated MezclasTablero")

# 3. Update SmartPosPanel
with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\SmartPosPanel.tsx', 'r', encoding='utf-8') as f:
    sp = f.read()

if 'addMezclaOrder\n    } = useEnterprise();' not in sp:
    sp = sp.replace('addDispatch\n    } = useEnterprise();', 'addDispatch, addMezclaOrder\n    } = useEnterprise();')
    
    # Inject MezclaOrder creation loop in executeCheckout
    mezcla_logic = """
            // --- GENERATE KDS MEZCLAS ---
            try {
                receiptCartItems.forEach((item, idx) => {
                    if (item.colorNote && item.colorNote.trim() !== '') {
                        addMezclaOrder({
                            id: `MZ-POS-${invoiceId.slice(-4)}-${idx}`,
                            saleId: invoiceId,
                            clientName: activeCustomer ? activeCustomer.name : 'Consumidor Final',
                            colorId: item.colorNote,
                            baseSku: item.sku,
                            baseName: item.name,
                            formula: { "INFO": "Generada desde POS" },
                            status: 0, // MezclaStatus.PENDING is 0 in enum
                            requestedAt: new Date().toISOString()
                        });
                    }
                });
            } catch (e) { console.error('KDS Mezcla Error', e); }
            
            // --- GENERATE DISPATCH MODULE ORDER ---"""
            
    sp = sp.replace('// --- GENERATE DISPATCH MODULE ORDER ---', mezcla_logic)
    with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\SmartPosPanel.tsx', 'w', encoding='utf-8') as f:
        f.write(sp)
    print("Updated SmartPosPanel")
