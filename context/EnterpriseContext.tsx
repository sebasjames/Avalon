import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { INVENTORY_DATA, MOCK_CRM_DEALS, MOCK_EVENT_LOG, MOCK_CRM_ACTIVITIES, MOCK_CRM_SETTINGS, MOCK_TAX_RULES, MOCK_PRICING_RULES, MOCK_PAYMENT_RULES, MOCK_SUPPLIERS } from '../constants';
import { Product, CrmDeal, SystemEvent, CrmContact, CrmActivity, CrmDealStage, InboundReceipt, CrmSettings, CrmPostSaleStage, CrmAssignmentLog, CrmNotification, AccountingTransaction, TaxRate, Recipe, TaxRule, PricingRule, PaymentRule, AuditReport, SystemUser, Supplier, ImportDossier, DispatchLog, KardexTransaction } from '../types';
import clientsData from '../data/clients.json';
import { KARDEX_TRANSACTIONS } from '../data/kardex_ledger';
import { ACCOUNTING_TRANSACTIONS } from '../data/accounting_ledger';

const CLIENTS_DATA = clientsData as CrmContact[];

interface EnterpriseContextType {
    inventory: Product[];
    deals: CrmDeal[];
    contacts: CrmContact[];
    activities: CrmActivity[];
    events: SystemEvent[];
    receipts: InboundReceipt[];
    crmSettings: CrmSettings;
    updateCrmSettings: (updates: Partial<CrmSettings>) => void;
    moveDealStage: (dealId: string, newStage: CrmDealStage | 'CLOSED_LOST', lostReason?: string) => void;
    moveContactPostSaleStage: (contactId: string, newStage: CrmPostSaleStage) => void;
    addEvent: (event: SystemEvent) => void;
    addContact: (contact: CrmContact) => void;
    addDeal: (deal: CrmDeal) => void;
    updateDeal: (dealId: string, updates: Partial<CrmDeal>) => void;
    addActivity: (activity: CrmActivity) => void;
    deleteContacts: (ids: string[]) => void;
    reassignContacts: (contactIds: string[], newOwnerId: string, transferDeals: boolean) => void;
    processInboundReceipt: (receipt: InboundReceipt) => void;
    distributeTransitInventory: (receiptId: string, locationDistributions: Record<string, Record<string, number>>) => void;
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
    clearNotifications: () => void;
    activeRole: 'admin' | 'manager' | 'Comercial' | 'Contabilidad' | 'POS' | 'Despachos';
    setActiveRole: (role: 'admin' | 'manager' | 'Comercial' | 'Contabilidad' | 'POS' | 'Despachos') => void;

    // --- RBAC ---
    systemUsers: SystemUser[];
    addSystemUser: (user: SystemUser) => void;
    updateSystemUser: (id: string, updates: Partial<SystemUser>) => void;
    deleteSystemUser: (id: string) => void;

    // --- Suppliers ---
    suppliers: Supplier[];
    addSupplier: (supplier: Supplier) => void;
    updateSupplier: (id: string, updates: Partial<Supplier>) => void;
    deleteSupplier: (id: string) => void;

    // --- Import Dossiers ---
    importDossiers: ImportDossier[];
    addImportDossier: (dossier: ImportDossier) => void;

    // --- Dispatches ---
    dispatches: DispatchLog[];
    addDispatch: (d: DispatchLog) => void;
    updateDispatch: (id: string, updates: Partial<DispatchLog>) => void;
    kardexTransactions: KardexTransaction[];
    updateBatchStatus: (productId: string, batchId: string, status: 'Disponible' | 'Cuarentena' | 'Retenido') => void;
    // Commission Rules
    commissionRules: CommissionRule[];
    addCommissionRule: (rule: Omit<CommissionRule, 'id'>) => void;
    updateCommissionRule: (id: string, updates: Partial<CommissionRule>) => void;
    deleteCommissionRule: (id: string) => void;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeRole, setActiveRole] = useState<'admin' | 'manager' | 'Comercial' | 'Contabilidad' | 'POS' | 'Despachos'>('admin');
    const [inventory, setInventory] = useState<Product[]>(INVENTORY_DATA);
    
    const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
        { id: '1', name: 'Admin Global', email: 'admin@avalon.com', baseRole: 'admin', customPermissions: {} as any, quota: 500000000 },
        { id: '2', name: 'Contabilidad Jefatura', email: 'conta@avalon.com', baseRole: 'Contabilidad', customPermissions: {} as any },
        { id: '3', name: 'Ana García', email: 'ana@avalon.com', baseRole: 'Comercial', customPermissions: {} as any, quota: 150000000, region: 'Norte', avatar: 'AG', phone: '+52 55 1234 5678' },
        { id: '4', name: 'Carlos Méndez', email: 'carlos@avalon.com', baseRole: 'Comercial', customPermissions: {} as any, quota: 100000000, region: 'Sur', avatar: 'CM', phone: '+52 55 8765 4321' },
        { id: '5', name: 'Lucía Fernández', email: 'lucia@avalon.com', baseRole: 'manager', customPermissions: {} as any, quota: 200000000, region: 'Global', avatar: 'LF', phone: '+52 55 1122 3344' },
    ]);
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [importDossiers, setImportDossiers] = useState<ImportDossier[]>([]);
    const [dispatches, setDispatches] = useState<DispatchLog[]>([
        {
            id: 'DSP-00101',
            dealId: 'D-MOCK-1',
            contactId: 'C-MOCK-1',
            status: 'PENDIENTE',
            promisedDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            items: [
                { sku: 'FG-PU-001', productName: 'Fondo Poliuretano Blanco', orderedQty: 50, deliveredQty: 0 },
                { sku: 'RM-SOL-005', productName: 'Solvente Universal', orderedQty: 20, deliveredQty: 0 }
            ]
        },
        {
            id: 'DSP-00102',
            dealId: 'D-MOCK-2',
            contactId: 'C-MOCK-2',
            status: 'ARMANDO_PEDIDO',
            promisedDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
            items: [
                { sku: 'FG-AQ-003', productName: 'Laca Acrílica Transparente', orderedQty: 100, deliveredQty: 100 }
            ]
        },
        {
            id: 'DSP-00103',
            dealId: 'D-MOCK-3',
            contactId: 'C-MOCK-3',
            status: 'EN_TRANSITO',
            promisedDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
            items: [
                { sku: 'FG-PU-002', productName: 'Barniz Poliuretano Mate', orderedQty: 30, deliveredQty: 30 }
            ]
        },
        {
            id: 'DSP-1001',
            dealId: 'D-MOCK-1',
            contactId: 'C-002',
            status: 'ENTREGADO',
            promisedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            actualDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            driver: 'Roberto Méndez',
            vehicle: 'Camión NKR-123',
            items: [
                { sku: 'CLORO-01', productName: 'Cloro Industrial', orderedQty: 50, deliveredQty: 50 },
                { sku: 'JABON-05', productName: 'Jabón Multiusos', orderedQty: 20, deliveredQty: 20 }
            ]
        }
    ]);

    const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([
        { id: '1', name: 'Comisión Estándar (2%)', type: 'Porcentaje', baseVariable: 'Facturación Neta (Menos Retención)', value: 2.0, target: 'Clientes Estándar / Regulares', active: true, hasAgingPenalty: true, hasDiscountPenalty: true },
        { id: '2', name: 'Comisión Clientes Especiales (1%)', type: 'Porcentaje', baseVariable: 'Facturación Neta (Menos Retención)', value: 1.0, target: 'Clientes Especiales (1%)', active: true, hasAgingPenalty: true, hasDiscountPenalty: true },
        { id: '3', name: 'Bono Volumen CARPOLY (>30%)', type: 'Porcentaje', baseVariable: 'Familia', value: 3.0, target: 'Todos', active: true, minVolumeThreshold: 30 },
        { id: '4', name: 'Compensación Quiebre de Stock (Manual)', type: 'Fijo', baseVariable: 'Selección Manual', value: 50000, target: 'Selección Manual', active: false },
    ]);

    const addCommissionRule = (rule: Omit<CommissionRule, 'id'>) => {
        const newRule = { ...rule, id: Math.random().toString(36).substr(2, 9) };
        setCommissionRules(prev => [...prev, newRule]);
    };

    const updateCommissionRule = (id: string, updates: Partial<CommissionRule>) => {
        setCommissionRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteCommissionRule = (id: string) => {
        setCommissionRules(prev => prev.filter(r => r.id !== id));
    };

    const [crmSettings, setCrmSettings] = useState<CrmSettings>(MOCK_CRM_SETTINGS);
    const updateCrmSettings = (updates: Partial<CrmSettings>) => setCrmSettings(prev => ({ ...prev, ...updates }));

    const addSystemUser = (user: SystemUser) => setSystemUsers(prev => [...prev, user]);
    const updateSystemUser = (id: string, updates: Partial<SystemUser>) => setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    const deleteSystemUser = (id: string) => setSystemUsers(prev => prev.filter(u => u.id !== id));

    const addSupplier = (supplier: Supplier) => setSuppliers(prev => [...prev, supplier]);
    const updateSupplier = (id: string, updates: Partial<Supplier>) => setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

    const addImportDossier = (dossier: ImportDossier) => setImportDossiers(prev => [...prev, dossier]);

    const addDispatch = (d: DispatchLog) => setDispatches(prev => [...prev, d]);
    const updateDispatch = (id: string, updates: Partial<DispatchLog>) => setDispatches(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

    const [kardexTransactions, setKardexTransactions] = useState<KardexTransaction[]>(KARDEX_TRANSACTIONS);

    const updateBatchStatus = (productId: string, batchId: string, status: 'Disponible' | 'Cuarentena' | 'Retenido') => {
        setInventory(prev => prev.map(p => {
            if (p.id === productId) {
                return {
                    ...p,
                    batches: p.batches.map(b => b.id === batchId ? { ...b, status } : b)
                };
            }
            return p;
        }));
    };

    // Se eliminó el useEffect que dependía de deals para inyectar mocks fijos en useState más abajo
    // --- Unified Mock Data Generator ---
    const seedData = useMemo(() => {
        if (!INVENTORY_DATA.length || !CLIENTS_DATA.length) {
            return { txs: [] as AccountingTransaction[], cts: CLIENTS_DATA };
        }

        // 1. Usar el ledger de contabilidad estático (1 año de historial realista)
        const generated: AccountingTransaction[] = [...ACCOUNTING_TRANSACTIONS];

        // 3. Update customer limits dynamically based on transactions
        const cts = CLIENTS_DATA.map((c, idx) => {
            const clientTxs = generated.filter(t => t.clientId === c.id);
            const unpaidTxs = clientTxs.filter(t => t.type === 'VENTA' && t.paymentStatus !== 'PAGADA');

            const creditLimitUsed = unpaidTxs.reduce((sum, t) => sum + (t.balance || 0), 0);
            const hasOverdueBills = unpaidTxs.some(t => t.paymentStatus === 'EN_MORA' || (t.dueDate && new Date(t.dueDate) < new Date()));

            const isGrowing = idx % 3 === 0;
            const isDecreasing = idx % 3 === 1;
            const annual = Math.floor(Math.random() * 50000000) + 10000000;
            
            let previousYear = annual;
            if (isGrowing) {
                previousYear = annual * (Math.random() * 0.4 + 0.2);
            } else if (isDecreasing) {
                previousYear = annual * (Math.random() * 1.5 + 1.5);
            } else {
                previousYear = annual * (Math.random() * 0.2 + 0.9);
            }
            
            const purchaseHistory: any = c.purchaseHistory || {
                annual,
                previousYear,
                historicalAverage: previousYear,
                monthly: annual / 12,
                quarterly: annual / 4,
                profitabilityMargin: parseFloat((Math.random() * 25 + 10).toFixed(1)),
                purchasePattern: isGrowing ? 'ESTABLE' : (isDecreasing ? 'BAJANDO' : 'ESTABLE'),
                evolution: Array.from({length: 12}).map((_, i) => ({
                    month: `Mes ${i+1}`,
                    amount: (annual / 12) * (Math.random() * 0.4 + 0.8)
                }))
            };

            return {
                ...c,
                creditLimit: c.name.includes('S.A.') || c.name.includes('Ltda') ? 60000000 : 25000000,
                creditLimitUsed,
                hasOverdueBills,
                purchaseHistory
            };
        });

        generated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const generatedDeals: CrmDeal[] = [];
        const owners = ['3', '4', '5'];
        let dealCounter = 1;
        
        // 1. Ganados a partir de transacciones reales
        generated.filter(t => t.type === 'VENTA').forEach(t => {
            const ownerId = owners[Math.floor(Math.random() * owners.length)];
            generatedDeals.push({
                id: `D-${dealCounter++}`,
                title: `Venta a ${t.client}`,
                contactId: t.clientId,
                value: t.total,
                stage: 'CLOSED_WON',
                expectedCloseDate: t.date,
                ownerId,
                notes: 'Generado desde transacciones',
                probability: 100
            });
        });

        // 2. Abiertos (Pipeline)
        const numOpenDeals = 30;
        const stages: ('LEAD'|'QUALIFIED'|'PROPOSAL'|'NEGOTIATION')[] = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'];
        for (let i = 0; i < numOpenDeals; i++) {
            const ownerId = owners[Math.floor(Math.random() * owners.length)];
            const contact = cts[Math.floor(Math.random() * cts.length)];
            const stage = stages[Math.floor(Math.random() * stages.length)];
            generatedDeals.push({
                id: `D-${dealCounter++}`,
                title: `Oportunidad ${contact.name}`,
                contactId: contact.id,
                value: Math.floor(Math.random() * 15000000) + 1000000,
                stage: stage,
                expectedCloseDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                ownerId,
                notes: 'Oportunidad en curso',
                probability: stage === 'LEAD' ? 10 : stage === 'QUALIFIED' ? 30 : stage === 'PROPOSAL' ? 50 : 80
            });
        }

        return { txs: generated, cts, deals: generatedDeals };
    }, []);

    const [deals, setDeals] = useState<CrmDeal[]>(seedData.deals);
    const [contacts, setContacts] = useState<CrmContact[]>(seedData.cts);
    const [activities, setActivities] = useState<CrmActivity[]>(MOCK_CRM_ACTIVITIES);
    const [events, setEvents] = useState<SystemEvent[]>(MOCK_EVENT_LOG);
    const [receipts, setReceipts] = useState<InboundReceipt[]>(() => {
        const sampleItems = INVENTORY_DATA.slice(0, 4);
        return [{
            id: `RCPT-MATRIZ-${Date.now()}`,
            documentNumber: 'CONTENEDOR-MATRIZ-001',
            dateIn: new Date().toISOString(),
            status: 'TRANSITO',
            items: sampleItems.map((item) => ({
                sku: item.sku,
                description: item.name,
                packages: Math.floor(Math.random() * 20) + 5,
                capacity: item.baseUnit || 'LT',
                totalLiters: Math.floor(Math.random() * 300) + 50,
                unitCost: item.unitCost || 0
            }))
        }];
    });
    const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);
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
        'Saldo a Favor',
        'Muestra'
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
    const addDeal = (deal: CrmDeal) => {
        setDeals(prev => [...prev, deal]);
    };
    const updateDeal = (dealId: string, updates: Partial<CrmDeal>) => {
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, ...updates } : d));
    };
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
        const transitReceipt = { ...receipt, status: 'TRANSITO' as const };
        setReceipts(prev => [transitReceipt, ...prev]);
    };

    const distributeTransitInventory = (receiptId: string, locationDistributions: Record<string, Record<string, number>>) => {
        setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, status: 'PROCESSED' } : r));

        setInventory(prevInv => {
            const newInv = [...prevInv];
            // We need to read from the CURRENT receipts state, but since setState is async, we capture it via functional update.
            // However, receipts is in the outer closure. Let's find it.
            const receipt = receipts.find(r => r.id === receiptId);
            if (!receipt) return prevInv;

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
                            reason: `Recepción Albarán y Distribución a Bodegas: ${receipt.documentNumber}`,
                            meta: { receiptId: receipt.id, qty: item.totalLiters, distribution: locationDistributions[item.sku] || {} }
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
                            reason: `Albarán ${receipt.documentNumber} tiene SKU no encontrado al distribuir: ${item.sku}`,
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
            if (c.status === 'PROSPECTO') {
                if (new Date(c.lastContactDate) < thresholdDate) {
                    return { ...c, status: 'INACTIVO' };
                }
            }
            return c;
        }));
    };

const MOCK_STATIC_NOTIFICATIONS: CrmNotification[] = [
    { id: 'm-1', type: 'COMERCIAL', title: 'Cierre de Trato', message: 'Trato cerrado con Grupo Constructor SA por $45M.', date: new Date().toISOString(), read: false },
    { id: 'm-2', type: 'INVENTARIO', title: 'Stock Crítico', message: 'Quedan 5 unidades de Base Blanca Exterior.', date: new Date().toISOString(), read: false },
    { id: 'm-3', type: 'PRODUCCION', title: 'Lote Terminado', message: 'Lote LT-4099 listo para calidad.', date: new Date().toISOString(), read: false },
    { id: 'm-4', type: 'FINANZAS', title: 'Pago Recibido', message: 'Se acreditó transferencia de Ferretería Central.', date: new Date().toISOString(), read: false },
    { id: 'm-5', type: 'LOGISTICA', title: 'Retraso en Entrega', message: 'Ruta Sur reporta 2 horas de retraso.', date: new Date().toISOString(), read: false },
    { id: 'm-6', type: 'SYSTEM', title: 'Actualización Exitosa', message: 'Base de datos sincronizada con DGI.', date: new Date().toISOString(), read: false },
    { id: 'm-7', type: 'COMERCIAL', title: 'Nuevo Lead', message: 'Prospecto de WhatsApp asignado a ti.', date: new Date().toISOString(), read: false },
    { id: 'm-8', type: 'INVENTARIO', title: 'Ingreso de Material', message: 'Llegaron 200 galones de resina epóxica.', date: new Date().toISOString(), read: false },
    { id: 'm-9', type: 'PRODUCCION', title: 'Falla en Máquina', message: 'Mantenimiento requerido en Mezcladora 2.', date: new Date().toISOString(), read: false },
    { id: 'm-10', type: 'CONTABILIDAD', title: 'Cierre de Caja', message: 'Reporte Z pendiente de revisión.', date: new Date().toISOString(), read: false },
    { id: 'm-11', type: 'COMERCIAL', title: 'Meta Superada', message: 'Has alcanzado el 110% de tu cuota mensual.', date: new Date().toISOString(), read: false },
    { id: 'm-12', type: 'LOGISTICA', title: 'Despacho Creado', message: 'Albarán ALB-10292 generado.', date: new Date().toISOString(), read: false },
    { id: 'm-13', type: 'FINANZAS', title: 'Aviso de Mora', message: 'Pinturas del Valle tiene factura vencida.', date: new Date().toISOString(), read: false },
    { id: 'm-14', type: 'INVENTARIO', title: 'Merma Registrada', message: '3 unidades dañadas en almacén principal.', date: new Date().toISOString(), read: false },
    { id: 'm-15', type: 'PRODUCCION', title: 'Cambio de Fórmula', message: 'Aprobada nueva receta para Esmalte Sintético.', date: new Date().toISOString(), read: false },
    { id: 'm-16', type: 'SYSTEM', title: 'Backup Completado', message: 'Copia de seguridad en la nube exitosa.', date: new Date().toISOString(), read: false },
    { id: 'm-17', type: 'COMERCIAL', title: 'Reunión Próxima', message: 'Llamada con Constructora XYZ en 15 mins.', date: new Date().toISOString(), read: false },
    { id: 'm-18', type: 'CONTABILIDAD', title: 'Gasto Registrado', message: 'Caja Menor: Compra de insumos.', date: new Date().toISOString(), read: false },
    { id: 'm-19', type: 'LOGISTICA', title: 'Vehículo Disponible', message: 'Camión 1 ha retornado al almacén.', date: new Date().toISOString(), read: false },
    { id: 'm-20', type: 'INVENTARIO', title: 'Reabastecimiento', message: 'Orden de compra generada automáticamente.', date: new Date().toISOString(), read: false }
];

    const getActiveNotifications = (): CrmNotification[] => {
        const notifs: CrmNotification[] = [...MOCK_STATIC_NOTIFICATIONS];
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

            if (c.status === 'PROSPECTO') {
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
        return notifs.filter(n => !dismissedNotifIds.includes(n.id));
    };

    const clearNotifications = () => {
        const active = getActiveNotifications();
        setDismissedNotifIds(prev => [...prev, ...active.map(n => n.id)]);
    };

    return (
        <EnterpriseContext.Provider value={{
            inventory, deals, contacts, activities, events, receipts, crmSettings,
            moveDealStage, moveContactPostSaleStage, addEvent, addContact, addDeal, updateDeal, addActivity, deleteContacts, reassignContacts,
            processInboundReceipt,
            distributeTransitInventory,
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
            runAuditAction,
            clearNotifications,
            activeRole,
            setActiveRole,
            systemUsers,
            addSystemUser,
            updateSystemUser,
            deleteSystemUser,
            suppliers,
            addSupplier,
            updateSupplier,
            deleteSupplier,
            importDossiers,
            addImportDossier,
            dispatches,
            addDispatch,
            updateDispatch,
            kardexTransactions,
            updateBatchStatus,
            updateCrmSettings,
            commissionRules,
            addCommissionRule,
            updateCommissionRule,
            deleteCommissionRule
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
