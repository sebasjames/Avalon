import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { MOCK_INVENTORY, MOCK_CRM_DEALS, MOCK_EVENT_LOG, MOCK_CRM_CONTACTS, MOCK_CRM_ACTIVITIES, MOCK_CRM_USERS, MOCK_CRM_SETTINGS, MOCK_TAX_RULES, MOCK_PRICING_RULES, MOCK_PAYMENT_RULES } from '../constants';
import { Product, CrmDeal, SystemEvent, CrmContact, CrmActivity, CrmDealStage, InboundReceipt, CrmUser, CrmSettings, CrmPostSaleStage, CrmAssignmentLog, CrmNotification, AccountingTransaction, TaxRate, Recipe, TaxRule, PricingRule, PaymentRule, AuditReport } from '../types';

interface EnterpriseContextType {
    inventory: Product[];
    deals: CrmDeal[];
    contacts: CrmContact[];
    activities: CrmActivity[];
    events: SystemEvent[];
    receipts: InboundReceipt[];
    crmUsers: CrmUser[];
    crmSettings: CrmSettings;
    moveDealStage: (dealId: string, newStage: CrmDealStage | 'CLOSED_LOST', lostReason?: string) => void;
    moveContactPostSaleStage: (contactId: string, newStage: CrmPostSaleStage) => void;
    addEvent: (event: SystemEvent) => void;
    addContact: (contact: CrmContact) => void;
    addDeal: (deal: CrmDeal) => void;
    addActivity: (activity: CrmActivity) => void;
    deleteContacts: (ids: string[]) => void;
    reassignContacts: (contactIds: string[], newOwnerId: string, transferDeals: boolean) => void;
    processInboundReceipt: (receipt: InboundReceipt) => void;
    getContactHealthScore: (contactId: string) => 'GREEN' | 'YELLOW' | 'RED';
    updateHealthThresholds: (redMax: number, yellowMax: number) => void;
    updateContact: (contactId: string, updates: Partial<CrmContact>) => void;
    updateInventoryProduct: (productId: string, updates: Partial<Product>) => void;
    updateInventoryStock: (productId: string, quantityChange: number) => void;
    tintometricRules: string[];
    updateTintometricRules: (rules: string[]) => void;
    reverseDisplayRules: string[];
    updateReverseDisplayRules: (rules: string[]) => void;
    setReverseDisplayRules: (rules: string[]) => void;
    litersToCunetesRules: string[];
    updateLitersToCunetesRules: (rules: string[]) => void;
    fractionalRules: string[];
    updateFractionalRules: (rules: string[]) => void;
    rawMaterialCategories: string[];
    updateRawMaterialCategories: (cats: string[]) => void;
    accountingShortcuts: string[];
    updateAccountingShortcuts: (shortcuts: string[]) => void;
    transactions: AccountingTransaction[];
    addTransaction: (t: AccountingTransaction) => void;
    assignmentLogs: CrmAssignmentLog[];
    cleanGarbageLeads: (daysInactive: number) => void;
    getActiveNotifications: () => CrmNotification[];
    globalSelectedContactId: string | null;
    setGlobalSelectedContactId: (id: string | null) => void;
    fullProfileContactId: string | null;
    setFullProfileContactId: (id: string | null) => void;
    globalInventorySearch: string;
    setGlobalInventorySearch: (s: string) => void;
    
    // --- Configuración POS ---
    paymentMethods: string[];
    setPaymentMethods: (methods: string[]) => void;
    pointsOfSale: string[];
    setPointsOfSale: (pos: string[]) => void;
    
    // --- Configuración Impuestos ---
    taxRates: TaxRate[];
    setTaxRates: (rates: TaxRate[]) => void;

    // --- Commercial Rules ---
    taxRules: TaxRule[];
    setTaxRules: (rules: TaxRule[]) => void;
    pricingRules: PricingRule[];
    setPricingRules: (rules: PricingRule[]) => void;
    paymentRules: PaymentRule[];
    setPaymentRules: (rules: PaymentRule[]) => void;

    // --- Fórmulas y Recetas ---
    recipes: Recipe[];
    addRecipe: (recipe: Recipe) => void;
    deleteRecipe: (id: string) => void;
    processCreditNote: (t: AccountingTransaction) => void;
    reconcileDatáfonoTransaction: (id: string, bankAmount: number, bankFee: number) => void;

    // --- Auto Auditor ---
    auditReports: AuditReport[];
    runAuditAction: () => void;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [inventory, setInventory] = useState<Product[]>(MOCK_INVENTORY);
    const [deals, setDeals] = useState<CrmDeal[]>(MOCK_CRM_DEALS);

    // --- Unified Mock Data Generator ---
    const seedData = useMemo(() => {
        if (!MOCK_INVENTORY.length || !MOCK_CRM_CONTACTS.length) {
            return { txs: [] as AccountingTransaction[], cts: MOCK_CRM_CONTACTS };
        }
        
        const generated: AccountingTransaction[] = [];
        
        // 1. Explicitly seed Caja Menor Transactions (2 reposiciones and 8 egresos)
        generated.push({
            id: 'RC-CM01',
            date: '2026-06-01',
            type: 'PAGO_RECIBIDO',
            client: 'Banco de Occidente',
            document: 'Reembolso Inicial de Caja Menor',
            productName: 'Reposición de fondos Caja Menor',
            sku: '-',
            family: '-',
            category: '-',
            qty: 1,
            total: 2000000,
            iva: 0,
            paymentMethod: 'Caja Menor',
            posLocation: 'Sede Principal Centro'
        });
        
        const cmExpenses = [
            { id: 'CE-CM01', date: '2026-06-03', client: 'Papelería El Cid', doc: 'Factura Papel y Carpetas', desc: 'Papelería de oficina y carpetas de archivo', total: 85000 },
            { id: 'CE-CM02', date: '2026-06-05', client: 'Café Córdoba', doc: 'Recibo Cafetería', desc: 'Café, azúcar y vasos desechables', total: 45000 },
            { id: 'CE-CM03', date: '2026-06-08', client: 'Distribuidora Envases', doc: 'Compra material empaque', desc: 'Envases plásticos de 1 Litro', total: 420000, sku: '202401', prodName: 'ENVASES PLASTICOS 1L' },
            { id: 'CE-CM04', date: '2026-06-12', client: 'Ferretería El Tornillo', doc: 'Compra de bombillos y cinta', desc: 'Mantenimiento luces oficina y cinta adhesiva', total: 32000 },
            { id: 'CE-CM05', date: '2026-06-15', client: 'Servicio de Aseo Limpio', doc: 'Servicios diversos', desc: 'Implementos de aseo y desinfectantes', total: 64000 },
            { id: 'CE-CM06', date: '2026-06-18', client: 'Empaques de Colombia', doc: 'Compra cajas cartón', desc: 'Cajas de cartón corrugado para despacho', total: 350000, sku: '202402', prodName: 'CAJAS DE CARTON' },
            { id: 'CE-CM07', date: '2026-06-22', client: 'Papelería El Cid', doc: 'Factura Lapiceros', desc: 'Lapiceros y marcadores para bodega', total: 28000 },
            { id: 'CE-CM08', date: '2026-06-24', client: 'Café Córdoba', doc: 'Recibo Café', desc: 'Suministros de cafetería y galletas', total: 38000 }
        ];
        
        cmExpenses.forEach(exp => {
            generated.push({
                id: exp.id,
                date: exp.date,
                type: 'COMPRA',
                client: exp.client,
                clientId: 'C-VENDEDOR-VARIOS',
                document: exp.doc,
                productName: exp.prodName || exp.desc,
                sku: exp.sku || '-',
                family: exp.sku ? 'EMPAQUES' : 'DIVERSOS',
                category: exp.sku ? 'FINISHED_GOOD' : 'SERVICE',
                qty: exp.sku ? 100 : 1,
                total: exp.total,
                iva: 0,
                paymentMethod: 'Caja Menor',
                posLocation: 'Sede Principal Centro'
            });
        });
        
        // 2. Generate random Sales and Purchases
        let ventaCounter = 1;
        let compraCounter = 1;
        let ajusteCounter = 1;
        
        const methods = [
            'Efectivo', 'Tarjeta', 'Transferencia', 'Nequi', 'Datáfonos (111505)'
        ];
        
        for (let i = 0; i < 200; i++) {
            const rand = Math.random();
            let type: 'VENTA' | 'COMPRA' | 'AJUSTE_MERMA' = 'VENTA';
            if (rand > 0.8 && rand <= 0.95) type = 'COMPRA';
            else if (rand > 0.95) type = 'AJUSTE_MERMA';
            
            const contact = MOCK_CRM_CONTACTS[Math.floor(Math.random() * MOCK_CRM_CONTACTS.length)];
            const product = MOCK_INVENTORY[Math.floor(Math.random() * MOCK_INVENTORY.length)];
            
            const date = new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];
            const qty = Math.floor(Math.random() * 15) + 1;
            
            let id = '';
            let total = 0;
            let iva = 0;
            let paymentMethod = '';
            
            if (type === 'VENTA') {
                id = `FV-${ventaCounter.toString().padStart(4, '0')}`;
                ventaCounter++;
                total = product.price * qty;
                const rate = product.taxRate ?? 19;
                iva = Math.round(total * (rate / 100));
                
                const isCredit = Math.random() > 0.5;
                paymentMethod = isCredit ? (Math.random() > 0.5 ? 'Crédito 30 días' : 'Crédito 60 días') : methods[Math.floor(Math.random() * methods.length)];
            } else if (type === 'COMPRA') {
                id = `ALB-${compraCounter.toString().padStart(4, '0')}`;
                compraCounter++;
                total = product.unitCost * qty;
                iva = 0;
                paymentMethod = 'Proveedores Nacionales (220505)';
            } else {
                id = `AJM-${ajusteCounter.toString().padStart(4, '0')}`;
                ajusteCounter++;
                total = product.unitCost * qty;
                iva = 0;
                paymentMethod = 'Inventario Físico';
            }
            
            let dueDate: string | undefined;
            let paymentStatus: 'PENDIENTE' | 'PAGADA' | 'EN_MORA' | undefined;
            let balance: number | undefined;
            
            if (type === 'VENTA') {
                const isCreditMethod = paymentMethod.toLowerCase().includes('cr') && (paymentMethod.toLowerCase().includes('30') || paymentMethod.toLowerCase().includes('60') || paymentMethod.toLowerCase().includes('di') || paymentMethod.toLowerCase().includes('d'));
                if (isCreditMethod) {
                    const days = paymentMethod.includes('30') ? 30 : 60;
                    const due = new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
                    dueDate = due.toISOString().split('T')[0];
                    
                    if (due < new Date()) {
                        paymentStatus = Math.random() > 0.3 ? 'EN_MORA' : 'PAGADA';
                    } else {
                        paymentStatus = Math.random() > 0.7 ? 'PAGADA' : 'PENDIENTE';
                    }
                    balance = paymentStatus === 'PAGADA' ? 0 : total + iva;
                    
                    if (paymentStatus === 'PAGADA' || (paymentStatus === 'PENDIENTE' && Math.random() > 0.5)) {
                        const paidAmount = paymentStatus === 'PAGADA' ? (total + iva) : Math.round((total + iva) * 0.6);
                        balance = (total + iva) - paidAmount;
                        
                        generated.push({
                            id: `RC-${id.split('-')[1]}`,
                            date: new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            type: 'PAGO_RECIBIDO',
                            client: contact.name,
                            clientId: contact.id,
                            document: `Abono/Pago Factura ${id}`,
                            productName: `Recaudo de Cartera`,
                            sku: '-',
                            family: '-',
                            category: '-',
                            qty: 1,
                            total: paidAmount,
                            iva: 0,
                            paymentMethod: 'Transferencia',
                            posLocation: 'Sede Principal Centro'
                        });
                    }
                } else {
                    paymentStatus = 'PAGADA';
                    balance = 0;
                    dueDate = dateStr;
                }
            }
            
            generated.push({
                id,
                date: dateStr,
                type,
                client: type === 'VENTA' ? contact.name : 'PROVEEDOR QUÍMICO S.A.',
                clientId: type === 'VENTA' ? contact.id : 'V-001',
                document: type === 'VENTA' ? `${contact.documentType || 'NIT'} ${contact.documentNumber}` : 'Orden Compra',
                sku: product.sku,
                productName: product.name,
                qty,
                total: total + iva,
                iva,
                paymentMethod,
                posLocation: 'Sede Principal Centro',
                dueDate,
                paymentStatus,
                balance
            });
        }
        
        // 3. Update customer limits dynamically based on transactions
        const cts = MOCK_CRM_CONTACTS.map(c => {
            const clientTxs = generated.filter(t => t.clientId === c.id);
            const unpaidTxs = clientTxs.filter(t => t.type === 'VENTA' && t.paymentStatus !== 'PAGADA');
            
            const creditLimitUsed = unpaidTxs.reduce((sum, t) => sum + (t.balance || 0), 0);
            const hasOverdueBills = unpaidTxs.some(t => t.paymentStatus === 'EN_MORA' || (t.dueDate && new Date(t.dueDate) < new Date()));
            
            return {
                ...c,
                creditLimit: c.name.includes('S.A.') || c.name.includes('Ltda') ? 60000000 : 25000000,
                creditLimitUsed,
                hasOverdueBills
            };
        });
        
        generated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return { txs: generated, cts };
    }, []);

    const [contacts, setContacts] = useState<CrmContact[]>(seedData.cts);
    const [activities, setActivities] = useState<CrmActivity[]>(MOCK_CRM_ACTIVITIES);
    const [events, setEvents] = useState<SystemEvent[]>(MOCK_EVENT_LOG);
    const [crmUsers, setCrmUsers] = useState<CrmUser[]>(MOCK_CRM_USERS);
    const [crmSettings, setCrmSettings] = useState<CrmSettings>(MOCK_CRM_SETTINGS);
    const [receipts, setReceipts] = useState<InboundReceipt[]>([]);
    const [assignmentLogs, setAssignmentLogs] = useState<CrmAssignmentLog[]>([]);
    
    // --- POS Configurations ---
    const [paymentMethods, setPaymentMethods] = useState<string[]>([
        'Efectivo', 
        'Tarjeta', 
        'Transferencia', 
        'Nequi', 
        'Crédito 30 días', 
        'Crédito 60 días', 
        'Crédito 90 días',
        'Saldo a Favor'
    ]);
    const [pointsOfSale, setPointsOfSale] = useState<string[]>([
        'Sede Principal Centro', 
        'Bodega Norte', 
        'Ventas Online',
        'Garantías / Averías'
    ]);
    
    // Tintometric Rules
    const [tintometricRules, setTintometricRules] = useState<string[]>([
        'PL 800', 'PM 800', 'TP 60', 'PL 720/10', 'TO 800', 'TO 840/10',
        'TINTILLA DE COLORES DESARROLADOS',
        'TINTILLA HIDROSOLUBLES',
        'TINTILLA COLORES BASE BLANCA',
        'TINTILLA SEMIPIGMENTARIA',
        'HNS 2A02', 'TS 364', 'COLOR'
    ]);
    
    // Reverse Display Rules
    const [reverseDisplayRules, setReverseDisplayRules] = useState<string[]>([
        'VETRO',
        'VET',
        'LACA CATALIZA',
        'PROCOQUINAL',
        'PF 45'
    ]);
    
    // Liters to Cuñetes Rules
    const [litersToCunetesRules, setLitersToCunetesRules] = useState<string[]>([
        'TZ 13', 'TZ 29', 'TZ 35', 'TZ 66', 'TZ 99', 'TM 893', 'TM 047',
        'TE 12', 'TE 34', 'TF 25', 'TF 45'
    ]);

    // Fractional Sales Rules
    const [fractionalRules, setFractionalRules] = useState<string[]>([
        'PL 800', 'PM 800', 'TP 60', 'PL 720/10', 'TO 800', 'TO 840/10',
        'TINTILLA DE COLORES DESARROLADOS',
        'TINTILLA HIDROSOLUBLES',
        'TINTILLA COLORES BASE BLANCA',
        'TINTILLA SEMIPIGMENTARIA',
        'HNS 2A02', 'TS 364', 'COLOR'
    ]);
    const [rawMaterialCategories, setRawMaterialCategories] = useState<string[]>(['Materia Prima Nacional', 'Materia Prima Importada']);
    const [accountingShortcuts, setAccountingShortcuts] = useState<string[]>(['Datáfonos (111505)', 'Crédito 30 días (130505)', 'Crédito 60 días (130505)', 'Crédito 90 días (130505)', 'Caja Menor (110510)']);
    
    // Tax Rates
    // Tax Rates
    const [taxRates, setTaxRates] = useState<TaxRate[]>([
        { id: 't1', name: 'IVA General', percentage: 19, isActive: true, isDefault: true },
        { id: 't2', name: 'IVA Reducido', percentage: 5, isActive: true, isDefault: false },
        { id: 't3', name: 'Exento', percentage: 0, isActive: true, isDefault: false }
    ]);

    // Fórmulas y Recetas
    const [recipes, setRecipes] = useState<Recipe[]>([
        {
            id: 'REC-1',
            finalProductId: '4191', 
            ingredients: [
                { productId: '202401', quantity: 0.8 }, 
                { productId: '202402', quantity: 0.2 },
                { productId: 'SERV-MANO-OBRA', quantity: 1 } 
            ]
        }
    ]);
    const [taxRules, setTaxRules] = useState<TaxRule[]>(MOCK_TAX_RULES);
    const [pricingRules, setPricingRules] = useState<PricingRule[]>(MOCK_PRICING_RULES);
    const [paymentRules, setPaymentRules] = useState<PaymentRule[]>(MOCK_PAYMENT_RULES);
    
    const addRecipe = (recipe: Recipe) => setRecipes(prev => [...prev, recipe]);
    const deleteRecipe = (id: string) => setRecipes(prev => prev.filter(r => r.id !== id));

    const [globalSelectedContactId, setGlobalSelectedContactId] = useState<string | null>(null);
    const [fullProfileContactId, setFullProfileContactId] = useState<string | null>(null);
    const [globalInventorySearch, setGlobalInventorySearch] = useState<string>('');
    
    // --- Transactions State ---
    const [transactions, setTransactions] = useState<AccountingTransaction[]>(seedData.txs);

    const addTransaction = (t: AccountingTransaction) => {
        setTransactions(prev => [t, ...prev]);
    };

    const reconcileDatáfonoTransaction = (id: string, bankAmount: number, bankFee: number) => {
        setTransactions(prev => prev.map(t => {
            if (t.id === id) {
                return {
                    ...t,
                    validationStatus: 'VALIDADA',
                    bankAmount,
                    bankFee,
                    reconciledDate: new Date().toISOString().split('T')[0]
                };
            }
            return t;
        }));
    };

    const processCreditNote = (t: AccountingTransaction) => {
        if (t.type !== 'NOTA_CREDITO') return;
        
        // 1. Añadir la transacción contable
        addTransaction(t);
        
        // 2. Sumar el stock a la bodega seleccionada (en este caso el totalStock global asume todo, pero se documenta posLocation)
        updateInventoryStock(t.sku, t.qty); // qty debe venir positivo
        
        // 3. Sumar el saldo a favor al cliente
        if (t.clientId) {
            setContacts(prev => prev.map(c => {
                if (c.id === t.clientId) {
                    return { ...c, accountBalance: (c.accountBalance || 0) + t.total };
                }
                return c;
            }));
        }
    };

    // --- Auto Auditor Implementation ---
    const initialReports: AuditReport[] = [
        {
            id: 'AUD-20260623',
            date: '2026-06-23',
            timestamp: '2026-06-23T08:00:00.000Z',
            status: 'WARNING',
            issues: [
                {
                    category: 'SIIGO_NIT',
                    severity: 'HIGH',
                    description: 'Tercero sin NIT en base de datos',
                    details: 'El contacto Ana Silva no tenía configurado su número de NIT para facturación de SIIGO.'
                }
            ]
        },
        {
            id: 'AUD-20260624',
            date: '2026-06-24',
            timestamp: '2026-06-24T08:00:00.000Z',
            status: 'SUCCESS',
            issues: []
        },
        {
            id: 'AUD-20260625',
            date: '2026-06-25',
            timestamp: '2026-06-25T08:00:00.000Z',
            status: 'ERROR',
            issues: [
                {
                    category: 'TAX_MATH',
                    severity: 'HIGH',
                    description: 'Diferencia en cálculo de IVA',
                    details: 'En la Factura FV-0010, el IVA registrado ($19,000) difiere del 19% calculado sobre la base ($12,000).'
                }
            ]
        },
        {
            id: 'AUD-20260626',
            date: '2026-06-26',
            timestamp: '2026-06-26T08:00:00.000Z',
            status: 'SUCCESS',
            issues: []
        }
    ];

    const [auditReports, setAuditReports] = useState<AuditReport[]>(initialReports);

    const runAuditAction = () => {
        const issues: any[] = [];

        // 1. SIIGO NIT Validation
        contacts.forEach(c => {
            if (!c.documentNumber || c.documentNumber.trim() === '') {
                issues.push({
                    category: 'SIIGO_NIT',
                    severity: 'HIGH',
                    description: `Cliente sin Documento: ${c.name}`,
                    details: `El cliente con ID ${c.id} tiene el campo de documento vacío, lo cual bloqueará la transmisión a SIIGO.`
                });
            } else if (c.documentNumber.length < 5) {
                issues.push({
                    category: 'SIIGO_NIT',
                    severity: 'MEDIUM',
                    description: `Documento posiblemente inválido: ${c.name}`,
                    details: `El número de documento '${c.documentNumber}' es demasiado corto para ser un NIT o Cédula válido.`
                });
            }
        });

        // 2. TAX_MATH Validation
        transactions.forEach(t => {
            if (t.type === 'VENTA' && t.iva > 0) {
                const product = inventory.find(p => p.sku === t.sku);
                const rate = product?.taxRate ?? 19;
                if (rate > 0) {
                    const base = t.total - t.iva;
                    const calculatedIva = Math.round(base * (rate / 100));
                    const diff = Math.abs(t.iva - calculatedIva);
                    if (diff > 100) {
                        issues.push({
                            category: 'TAX_MATH',
                            severity: 'HIGH',
                            description: `Diferencia de IVA en Comprobante ${t.id}`,
                            details: `El IVA registrado es $${t.iva.toLocaleString('es-CO')}, pero el IVA calculado es $${calculatedIva.toLocaleString('es-CO')} (Base: $${base.toLocaleString('es-CO')} a tarifa del ${rate}%).`
                        });
                    }
                }
            }
        });

        // 3. SKU_ORPHAN Validation
        transactions.forEach(t => {
            if (t.sku && t.sku !== '-' && t.sku !== '') {
                const productExists = inventory.some(p => p.sku === t.sku);
                if (!productExists) {
                    issues.push({
                        category: 'SKU_ORPHAN',
                        severity: 'HIGH',
                        description: `SKU Huérfano en Transacción ${t.id}`,
                        details: `La transacción hace referencia al SKU '${t.sku}' (${t.productName}), pero este producto no existe en el catálogo.`
                    });
                }
            }
        });

        // 4. LEDGER_INTEGRITY Validation
        const cmTxs = transactions.filter(t => t.paymentMethod === 'Caja Menor');
        const cmSales = cmTxs.filter(t => t.type === 'VENTA');
        if (cmSales.length > 0) {
            issues.push({
                category: 'LEDGER_INTEGRITY',
                severity: 'MEDIUM',
                description: `Ventas registradas con Caja Menor`,
                details: `Se detectaron ${cmSales.length} facturas de venta usando 'Caja Menor' como método de recaudo contable.`
            });
        }

        const status = issues.some(i => i.severity === 'HIGH') 
            ? 'ERROR' 
            : issues.length > 0 
                ? 'WARNING' 
                : 'SUCCESS';

        const todayStr = new Date().toISOString().split('T')[0];
        const newReport: AuditReport = {
            id: `AUD-${Date.now()}`,
            date: todayStr,
            timestamp: new Date().toISOString(),
            status,
            issues
        };

        setAuditReports(prev => [newReport, ...prev]);
    };

    const updateInventoryStock = (productId: string, quantityChange: number) => {
        setInventory(prev => prev.map(p => 
            p.id === productId ? { ...p, totalStock: p.totalStock + quantityChange } : p
        ));
    };

    const addEvent = (event: SystemEvent) => setEvents(prev => [event, ...prev]);
    const addContact = (contact: CrmContact) => setContacts(prev => [contact, ...prev]);
    const addDeal = (deal: CrmDeal) => setDeals(prev => [deal, ...prev]);
    const addActivity = (activity: CrmActivity) => setActivities(prev => [activity, ...prev]);
    const deleteContacts = (ids: string[]) => setContacts(prev => prev.filter(c => !ids.includes(c.id)));

    const updateContact = (contactId: string, updates: Partial<CrmContact>) => {
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates } : c));
    };

    const updateInventoryProduct = (productId: string, updates: Partial<Product>) => {
        setInventory(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    };

    const updateTintometricRules = (rules: string[]) => {
        setTintometricRules(rules);
    };

    const updateLitersToCunetesRules = (rules: string[]) => {
        setLitersToCunetesRules(rules);
    };

    const updateFractionalRules = (rules: string[]) => {
        setFractionalRules(rules);
    };

    const updateRawMaterialCategories = (cats: string[]) => {
        setRawMaterialCategories(cats);
    };

    const getContactHealthScore = (contactId: string): 'GREEN' | 'YELLOW' | 'RED' => {
        const wonValue = deals
            .filter(d => d.contactId === contactId && d.stage === 'CLOSED_WON')
            .reduce((sum, d) => sum + d.value, 0);
        
        const { redMax, yellowMax } = crmSettings.clientHealthThresholds;
        if (wonValue <= redMax) return 'RED';
        if (wonValue <= yellowMax) return 'YELLOW';
        return 'GREEN';
    };

    const updateHealthThresholds = (redMax: number, yellowMax: number) => {
        setCrmSettings(prev => ({
            ...prev,
            clientHealthThresholds: { redMax, yellowMax }
        }));
    };

    const reassignContacts = (contactIds: string[], newOwnerId: string, transferDeals: boolean) => {
        // Log assignments
        const newLogs: CrmAssignmentLog[] = contactIds.map(cid => {
            const contact = contacts.find(c => c.id === cid);
            return {
                id: `AL-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                contactId: cid,
                previousOwnerId: contact?.ownerId,
                newOwnerId,
                assignedByUserId: 'admin-user', // Mocked current user
                date: new Date().toISOString()
            };
        });
        setAssignmentLogs(prev => [...newLogs, ...prev]);

        setContacts(prev => prev.map(c => 
            contactIds.includes(c.id) ? { ...c, ownerId: newOwnerId } : c
        ));
        
        if (transferDeals) {
            setDeals(prev => prev.map(d => 
                contactIds.includes(d.contactId) && d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST'
                    ? { ...d, ownerId: newOwnerId } 
                    : d
            ));
        }

        // Add a system event for the bulk reassignment
        const logEntry: SystemEvent = {
            event_id: `EVT-REASSIGN-${Date.now()}`,
            event_type: 'CONTACT_REASSIGN',
            event_category: 'OPERATIONS',
            entity_type: 'CONTACT',
            entity_id: contactIds.length === 1 ? contactIds[0] : 'BULK',
            actor_type: 'HUMAN',
            actor_id: 'USER',
            timestamp: new Date().toISOString(),
            previous_state: null,
            new_state: { newOwnerId },
            context: {
                channel: 'SYSTEM',
                reason: `Reasignación masiva de ${contactIds.length} contactos a ${newOwnerId}`,
            },
            causal_chain_id: `REASSIGN-${Date.now()}`,
            confidence_level: 'MANUAL'
        };
        addEvent(logEntry);
    };

    const moveContactPostSaleStage = (contactId: string, newStage: CrmPostSaleStage) => {
        setContacts(prev => prev.map(c => 
            c.id === contactId ? { ...c, postSaleStage: newStage } : c
        ));
    };

    const moveDealStage = (dealId: string, newStage: CrmDealStage | 'CLOSED_LOST', lostReason?: string) => {
        setDeals(prevDeals => prevDeals.map(deal => {
            if (deal.id === dealId) {
                // Feature: Integración Fluida CRM -> Inventario
                if (newStage === 'CLOSED_WON' && deal.stage !== 'CLOSED_WON') {
                    // Buscar un producto al azar para descontar inventario en esta simulación
                    setInventory(prevInv => {
                        const newInv = [...prevInv];
                        const productIdx = Math.floor(Math.random() * newInv.length);
                        const product = newInv[productIdx];
                        
                        // Reservamos 10 unidades como ejemplo real
                        const qtyToReserve = 10;
                        newInv[productIdx] = {
                            ...product,
                            reservedStock: product.reservedStock + qtyToReserve
                        };

                        // Crear EventLog Auditoría
                        const logEntry: SystemEvent = {
                            event_id: `EVT-${Date.now()}`,
                            event_type: 'STOCK_RESERVE',
                            event_category: 'OPERATIONS',
                            entity_type: 'SKU',
                            entity_id: product.sku,
                            actor_type: 'SYSTEM',
                            actor_id: 'CRM-PIPELINE',
                            timestamp: new Date().toISOString(),
                            previous_state: { reservedStock: product.reservedStock },
                            new_state: { reservedStock: product.reservedStock + qtyToReserve },
                            context: {
                                channel: 'SYSTEM',
                                reason: `Deal Ganado: ${deal.title}`,
                                meta: { dealId, qty: qtyToReserve }
                            },
                            causal_chain_id: dealId,
                            confidence_level: 'AUTOMATIC'
                        };
                        
                        setEvents(e => [logEntry, ...e]);
                        
                        return newInv;
                    });
                    
                    // Auto-transfer to Post-Sale Pipeline
                    setContacts(prev => prev.map(c => 
                        c.id === deal.contactId ? { 
                            ...c, 
                            status: 'VINCULADO', 
                            postSaleStage: 'ONBOARDING'
                        } : c
                    ));
                }
                
                return { ...deal, stage: newStage as CrmDealStage, lostReason };
            }
            return deal;
        }));
    };

    const processInboundReceipt = (receipt: InboundReceipt) => {
        setReceipts(prev => [receipt, ...prev]);
        
        setInventory(prevInv => {
            const newInv = [...prevInv];
            
            receipt.items.forEach(item => {
                const productIdx = newInv.findIndex(p => p.sku === item.sku || p.originalSku === item.sku);
                
                if (productIdx >= 0) {
                    const product = newInv[productIdx];
                    const oldStock = product.totalStock;
                    const newStock = oldStock + item.totalLiters;
                    
                    // Calculamos promedio ponderado
                    const oldTotalValue = oldStock * product.unitCost;
                    const incomingValue = item.totalLiters * item.unitCost;
                    const newAvgCost = newStock > 0 ? (oldTotalValue + incomingValue) / newStock : item.unitCost;
                    
                    newInv[productIdx] = {
                        ...product,
                        totalStock: newStock,
                        unitCost: newAvgCost
                    };

                    const logEntry: SystemEvent = {
                        event_id: `EVT-RCPT-${Date.now()}-${item.sku}`,
                        event_type: 'STOCK_RECEIPT',
                        event_category: 'OPERATIONS',
                        entity_type: 'SKU',
                        entity_id: product.sku,
                        actor_type: 'HUMAN',
                        actor_id: 'USER',
                        timestamp: new Date().toISOString(),
                        previous_state: { totalStock: oldStock, unitCost: product.unitCost },
                        new_state: { totalStock: newStock, unitCost: newAvgCost },
                        context: {
                            channel: 'SYSTEM',
                            reason: `Recepción Albarán: ${receipt.documentNumber}`,
                            meta: { receiptId: receipt.id, qty: item.totalLiters }
                        },
                        causal_chain_id: receipt.id,
                        confidence_level: 'ASSISTED'
                    };
                    
                    setEvents(e => [logEntry, ...e]);
                } else {
                    const errorLog: SystemEvent = {
                        event_id: `EVT-ERR-${Date.now()}-${item.sku}`,
                        event_type: 'UNKNOWN_SKU_RECEIPT',
                        event_category: 'ERROR',
                        entity_type: 'SKU',
                        entity_id: item.sku,
                        actor_type: 'HUMAN',
                        actor_id: 'USER',
                        timestamp: new Date().toISOString(),
                        previous_state: null,
                        new_state: null,
                        context: {
                            channel: 'SYSTEM',
                            reason: `Albarán ${receipt.documentNumber} tiene SKU no encontrado: ${item.sku}`,
                        },
                        causal_chain_id: receipt.id,
                        confidence_level: 'MANUAL'
                    };
                    setEvents(e => [errorLog, ...e]);
                }
            });
            
            return newInv;
        });
    };

    const cleanGarbageLeads = (daysInactive: number) => {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - daysInactive);
        
        setContacts(prev => prev.map(c => {
            if (c.status === 'LEAD' || c.status === 'PROSPECTO') {
                if (new Date(c.lastContactDate) < thresholdDate) {
                    return { ...c, status: 'INACTIVO' };
                }
            }
            return c;
        }));
    };

    const getActiveNotifications = (): CrmNotification[] => {
        const notifs: CrmNotification[] = [];
        const today = new Date();
        
        contacts.forEach(c => {
            c.decisionMakers?.forEach(dm => {
                if (dm.birthday) {
                    const bdate = new Date(dm.birthday);
                    const nextBday = new Date(today.getFullYear(), bdate.getMonth(), bdate.getDate());
                    if (nextBday.getTime() < today.getTime()) {
                        nextBday.setFullYear(today.getFullYear() + 1);
                    }
                    const diffDays = Math.ceil(Math.abs(nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)); 
                    if (diffDays <= 7) {
                        notifs.push({
                            id: `notif-bd-${c.id}-${dm.name}`,
                            type: 'BIRTHDAY',
                            title: 'Cumpleaños Próximo',
                            message: `${dm.name} (${c.name}) cumple años en ${diffDays} días.`,
                            date: today.toISOString(),
                            read: false,
                            relatedContactId: c.id
                        });
                    }
                }
            });

            if (c.status === 'LEAD' || c.status === 'PROSPECTO') {
                const lastContact = new Date(c.lastContactDate);
                const diffDays = Math.ceil(Math.abs(today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays > 30) {
                    notifs.push({
                        id: `notif-gb-${c.id}`,
                        type: 'GARBAGE_WARNING',
                        title: 'Lead Inactivo',
                        message: `${c.name} lleva ${diffDays} días sin contacto.`,
                        date: today.toISOString(),
                        read: false,
                        relatedContactId: c.id
                    });
                }
            }
        });
        return notifs;
    };

    return (
        <EnterpriseContext.Provider value={{ 
            inventory, deals, contacts, activities, events, receipts, crmUsers, crmSettings,
            moveDealStage, moveContactPostSaleStage, addEvent, addContact, addDeal, addActivity, deleteContacts, reassignContacts,
            processInboundReceipt,
            getContactHealthScore,
            updateHealthThresholds,
            updateContact,
            updateInventoryProduct,
            updateInventoryStock,
            tintometricRules,
            updateTintometricRules,
            reverseDisplayRules,
            setReverseDisplayRules,
            updateReverseDisplayRules: setReverseDisplayRules,
            litersToCunetesRules,
            updateLitersToCunetesRules,
            fractionalRules,
            updateFractionalRules,
            rawMaterialCategories,
            updateRawMaterialCategories,
            accountingShortcuts,
            updateAccountingShortcuts: setAccountingShortcuts,
            assignmentLogs,
            cleanGarbageLeads,
            getActiveNotifications,
            globalSelectedContactId,
            setGlobalSelectedContactId,
            fullProfileContactId,
            setFullProfileContactId,
            globalInventorySearch,
            setGlobalInventorySearch,
            
            paymentMethods,
            setPaymentMethods,
            pointsOfSale,
            setPointsOfSale,
            transactions,
            addTransaction,
            taxRates,
            setTaxRates,
            recipes,
            addRecipe,
            deleteRecipe,
            processCreditNote,
            reconcileDatáfonoTransaction,
            taxRules,
            setTaxRules,
            pricingRules,
            setPricingRules,
            paymentRules,
            setPaymentRules,
            auditReports,
            runAuditAction
        }}>
            {children}
        </EnterpriseContext.Provider>
    );
};

export const useEnterprise = () => {
    const context = useContext(EnterpriseContext);
    if (context === undefined) {
        throw new Error('useEnterprise must be used within an EnterpriseProvider');
    }
    return context;
};
