// @ts-nocheck
import { useEscapeKey } from '../hooks/useEscapeKey';
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Calculator, FileSpreadsheet, Download, AlertTriangle, 
    CheckCircle2, DollarSign, PackageOpen, TableProperties,
    Calendar, Filter, Search, ArrowRight, UserCheck, Mail, Send, CreditCard, Banknote, Wallet, HandCoins, UploadCloud, Landmark, X, BrainCircuit, Cloud
} from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { AccountingTransaction } from '../types';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TransactionsExcelModal } from './TransactionsExcelModal';
import { SabanaTab } from './accounting/SabanaTab';
import { CierresTab } from './accounting/CierresTab';
import { ConciliacionDatafonoTab } from './accounting/ConciliacionDatafonoTab';
import { CajaMenorTab } from './accounting/CajaMenorTab';
import { SiigoSyncTab } from './accounting/SiigoSyncTab';
import { formatCOP } from '../utils/format';

export const AccountingModule: React.FC = () => {
    const { inventory, contacts, paymentMethods, pointsOfSale, transactions, accountingShortcuts, reconcileDatáfonoTransaction, addTransaction, updateInventoryStock, auditReports, runAuditAction } = useEnterprise();
    const { tabId } = useParams<{ tabId: string }>();
    const navigate = useNavigate();

    // 5 Operational Tabs
    const validTabs = ['cierres', 'caja_menor', 'conciliacion_datafono', 'sabana', 'siigo_sync'];
    const normalizedTab = tabId === 'exportacion' ? 'siigo_sync' : (tabId || 'cierres');

    const TABS_CONFIG = [
        { id: 'cierres', label: 'Cierres Z (Caja)', icon: Calculator },
        { id: 'caja_menor', label: 'Caja Menor', icon: Wallet },
        { id: 'conciliacion_datafono', label: 'Conciliación Datáfonos', icon: CreditCard },
        { id: 'sabana', label: 'Sábana Operativa', icon: TableProperties },
        { id: 'siigo_sync', label: 'Sincronización SIIGO', icon: Cloud },
    ];

    const activeTab = (validTabs.includes(normalizedTab) ? normalizedTab : 'cierres') as 'cierres' | 'caja_menor' | 'conciliacion_datafono' | 'sabana' | 'siigo_sync';

    useEffect(() => {
        if (!validTabs.includes(normalizedTab)) {
            navigate('/accounting/cierres', { replace: true });
        }
    }, [normalizedTab, navigate]);

    // --- SABANA FILTER STATE ---
    const [expandedCarteraClient, setExpandedCarteraClient] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    const initialFilterState = {
        dateFrom: '',
        dateTo: '',
        type: 'ALL' as 'ALL' | 'VENTA' | 'COMPRA' | 'AJUSTE_MERMA',
        tercero: '', 
        documento: '', 
        minAmount: '',
        maxAmount: '',
        concepto: ''
    };
    const [draftFilters, setDraftFilters] = useState(initialFilterState);
    const [appliedFilters, setAppliedFilters] = useState(initialFilterState);
    const [activeShortcutFilter, setActiveShortcutFilter] = useState<string>('Todos');
    const [cierreTimeRange, setCierreTimeRange] = useState<'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'MES_PASADO' | 'ESTE_AÑO' | 'PERSONALIZADO'>('ESTE_MES');
    const [cierreDateFrom, setCierreDateFrom] = useState('');
    const [cierreDateTo, setCierreDateTo] = useState('');
    const [showZReport, setShowZReport] = useState(false);

    const soloVentas = useMemo(() => transactions.filter(t => t.type === 'VENTA'), [transactions]);

    const [salesMethodFilter, setSalesMethodFilter] = useState('ALL');
    const [salesDateFrom, setSalesDateFrom] = useState('');
    const [salesDateTo, setSalesDateTo] = useState('');

    const uniqueSalesPaymentMethods = useMemo(() => {
        const set = new Set(soloVentas.map(v => v.paymentMethod).filter(Boolean));
        return Array.from(set);
    }, [soloVentas]);

    const filteredSales = useMemo(() => {
        return soloVentas.filter(v => {
            if (salesMethodFilter !== 'ALL' && v.paymentMethod !== salesMethodFilter) {
                return false;
            }
            if (salesDateFrom && v.date < salesDateFrom) return false;
            if (salesDateTo && v.date > salesDateTo) return false;
            return true;
        });
    }, [soloVentas, salesMethodFilter, salesDateFrom, salesDateTo]);


    // --- NUEVO: REGISTRO DE RECIBOS DE CAJA (PAGOS DE CLIENTES) ---
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentClient, setPaymentClient] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentBank, setPaymentBank] = useState('Davivienda');
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentSelectedInvoice, setPaymentSelectedInvoice] = useState<AccountingTransaction | null>(null);
    const [paymentDiffHandling, setPaymentDiffHandling] = useState<'PARTIAL' | 'DISCOUNT' | 'ADVANCE'>('PARTIAL');


    // --- NUEVO: BUZÓN DE FACTURAS PROVEEDORES (CORREO) ---
    const [emails, setEmails] = useState<any[]>([
        {
            id: 'em-1',
            sender: 'Facturación Corona <facturacion@corona.com.co>',
            subject: 'Factura Electrónica de Venta - Corona - No. FE-84920',
            date: '2026-06-25',
            body: 'Estimado Cliente,\nAdjunto a este correo encontrará la Factura Electrónica de Venta No. FE-84920 correspondiente a su compra de insumos de pintura.',
            attachment: 'corona_fe_84920.xml',
            attachmentSize: '45 KB',
            parsedData: {
                provider: 'Corona Colombia S.A.S',
                nit: '860002192-3',
                invoiceId: 'FE-84920',
                date: '2026-06-25',
                subtotal: 12000000,
                iva: 2280000,
                total: 14280000,
                items: 'Insumos Base Pintura y Pigmentos'
            },
            status: 'PENDIENTE'
        },
        {
            id: 'em-2',
            sender: 'Plásticos del Caribe S.A. <ventas@plasticoscaribe.com>',
            subject: 'Envío de Factura y Representación Gráfica - F-1193',
            date: '2026-06-26',
            body: 'Adjuntamos la factura F-1193 por concepto de envases plásticos de 1 Galón y 1/4 de Galón suministrados a su bodega.',
            attachment: 'factura_plasticos_1193.xml',
            attachmentSize: '32 KB',
            parsedData: {
                provider: 'Plásticos del Caribe S.A.',
                nit: '890901234-5',
                invoiceId: 'F-1193',
                date: '2026-06-26',
                subtotal: 3500000,
                iva: 665000,
                total: 4165000,
                items: 'Envases Plásticos 1GL y 1/4'
            },
            status: 'PENDIENTE'
        },
        {
            id: 'em-3',
            sender: 'Químicos de Antioquia <contacto@quimicosant.com.co>',
            subject: 'Documento Soporte Electrónico - Q-9021',
            date: '2026-06-27',
            body: 'Envío de facturación electrónica Q-9021. Favor acusar recibo.',
            attachment: 'quimicos_q9021.xml',
            attachmentSize: '28 KB',
            parsedData: {
                provider: 'Químicos de Antioquia S.A.S',
                nit: '900123456-1',
                invoiceId: 'Q-9021',
                date: '2026-06-27',
                subtotal: 7800000,
                iva: 1482000,
                total: 9282000,
                items: 'Solventes y Aditivos Especiales'
            },
            status: 'PENDIENTE'
        }
    ]);
    const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
    const [showAiFormModal, setShowAiFormModal] = useState(false);
    const [inventorySortBy, setInventorySortBy] = useState<'VALOR_DESC' | 'VALOR_ASC' | 'STOCK_DESC' | 'STOCK_ASC' | 'SKU_ASC' | 'SKU_DESC'>('VALOR_DESC');
    const [inventorySearchQuery, setInventorySearchQuery] = useState('');
    const [cxPData, setCxPData] = useState({
        totalPagar: 68500000,
        pagarVencido: 12400000,
        pagarAlDia: 56100000,
        providerList: [
            { provider: 'Químicos del Caribe S.A.', document: 'NIT 890.203.491-2', invoiceId: 'FE-1093', dueDate: '2026-07-15', balance: 28500000, status: 'AL_DIA' },
            { provider: 'Distribuidora Central de Solventes', document: 'NIT 900.123.854-5', invoiceId: 'FE-3482', dueDate: '2026-06-20', balance: 12400000, status: 'VENCIDO' },
            { provider: 'Empaques Industriales de Colombia', document: 'NIT 860.002.394-1', invoiceId: 'FE-9082', dueDate: '2026-07-28', balance: 15600000, status: 'AL_DIA' },
            { provider: 'Transportes Integrados de Carga', document: 'NIT 901.442.109-8', invoiceId: 'FE-7781', dueDate: '2026-07-05', balance: 12000000, status: 'AL_DIA' }
        ]
    });
    const [showCxPPaymentModal, setShowCxPPaymentModal] = useState(false);
    const [selectedCxPInvoice, setSelectedCxPInvoice] = useState<any | null>(null);
    const [cxPPaymentAmount, setCxPPaymentAmount] = useState('');
    const [cxPPaymentDate, setCxPPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [cxPPaymentMethod, setCxPPaymentMethod] = useState('TRANSFERENCIA');
    const [leftPanelMode, setLeftPanelMode] = useState<'AR' | 'AP'>('AR');
    
    // AI Form Editable Fields State
    const [aiProvider, setAiProvider] = useState('');
    const [aiNit, setAiNit] = useState('');
    const [aiInvoiceId, setAiInvoiceId] = useState('');
    const [aiDate, setAiDate] = useState('');
    const [aiSubtotal, setAiSubtotal] = useState('');
    const [aiIva, setAiIva] = useState('');
    const [aiTotal, setAiTotal] = useState('');
    const [aiItems, setAiItems] = useState('');

    const [egresoType, setEgresoType] = useState<'GASTO' | 'INVENTARIO'>('GASTO');
    const [egresoFecha, setEgresoFecha] = useState(new Date().toISOString().split('T')[0]);
    const [egresoTercero, setEgresoTercero] = useState('');
    const [egresoConcepto, setEgresoConcepto] = useState('');
    const [egresoValor, setEgresoValor] = useState('');
    const [egresoSku, setEgresoSku] = useState('');
    const [egresoCantidad, setEgresoCantidad] = useState('');
    const [showExcelModal, setShowExcelModal] = useState(false);

    // --- CAJA MENOR HISTORY FILTERS ---
    const [cmHistoryDateFrom, setCmHistoryDateFrom] = useState('');
    const [cmHistoryDateTo, setCmHistoryDateTo] = useState('');
    const [cmHistorySku, setCmHistorySku] = useState('');
    const [cmHistoryMinPrice, setCmHistoryMinPrice] = useState('');
    const [cmHistoryMaxPrice, setCmHistoryMaxPrice] = useState('');

    // --- AUTO AUDITOR SELECTIONS ---
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Escape key hooks
  useEscapeKey(() => setShowPaymentModal(false), showPaymentModal);

    const activeReport = useMemo(() => {
        if (selectedReportId) {
            return auditReports.find(r => r.id === selectedReportId) || auditReports[0];
        }
        return auditReports[0];
    }, [auditReports, selectedReportId]);


    // 24-hour daily scheduler check
    useEffect(() => {
        const lastAudit = localStorage.getItem('avalon_last_audit_timestamp');
        const now = Date.now();
        if (!lastAudit || now - Number(lastAudit) > 24 * 60 * 60 * 1000) {
            runAuditAction();
            localStorage.setItem('avalon_last_audit_timestamp', now.toString());
        }
    }, [runAuditAction]);

    // Sugerencias automáticas cruzando venta y depósito de banco

    // --- FILTER SABANA GENERAL ---
    const filteredSabana = useMemo(() => {
        return transactions.filter(t => {
            if (activeShortcutFilter !== 'Todos' && t.paymentMethod !== activeShortcutFilter) return false;
            if (appliedFilters.type !== 'ALL' && t.type !== appliedFilters.type) return false;
            
            if (appliedFilters.dateFrom && new Date(t.date) < new Date(appliedFilters.dateFrom)) return false;
            if (appliedFilters.dateTo && new Date(t.date) > new Date(appliedFilters.dateTo)) return false;
            
            if (appliedFilters.minAmount && t.total < Number(appliedFilters.minAmount)) return false;
            if (appliedFilters.maxAmount && t.total > Number(appliedFilters.maxAmount)) return false;
            
            if (appliedFilters.tercero) {
                const searchStr = appliedFilters.tercero.toLowerCase();
                if (!t.client.toLowerCase().includes(searchStr) && !t.document.toLowerCase().includes(searchStr)) return false;
            }
            
            if (appliedFilters.documento) {
                const searchStr = appliedFilters.documento.toLowerCase();
                if (!t.id.toLowerCase().includes(searchStr)) return false;
            }
            
            if (appliedFilters.concepto) {
                const searchStr = appliedFilters.concepto.toLowerCase();
                if (!t.sku.toLowerCase().includes(searchStr) && !t.productName.toLowerCase().includes(searchStr)) return false;
            }
            
            return true;
        });
    }, [transactions, appliedFilters, activeShortcutFilter]);

    // Export function moved down to access all data

    const carteraData = useMemo(() => {
        const cuentasPorCobrar = transactions.filter(t => {
            const pm = t.paymentMethod?.toLowerCase() || '';
            const isCredit = pm.includes('cr') && (pm.includes('dito') || pm.includes('30') || pm.includes('60') || pm.includes('di') || pm.includes('d'));
            return t.type === 'VENTA' && isCredit;
        });
        
        let carteraTotal = 0;
        let carteraMora = 0;
        let carteraSana = 0;
        
        let bucket30 = 0;
        let bucket60 = 0;
        let bucket90 = 0;
        let bucket90Plus = 0;
        
        const now = new Date();
        
        const clientsWithDebt: Record<string, { client: string, document: string, totalDebt: number, status: 'MORA' | 'AL_DIA' | 'PAGADO', daysOverdue: number, latestDue: string }> = {};

        cuentasPorCobrar.forEach(t => {
            if (!t.balance) return; // Pagada
            
            carteraTotal += t.balance;
            
            const due = new Date(t.dueDate || t.date);
            const diffTime = now.getTime() - due.getTime();
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (daysOverdue > 0) {
                carteraMora += t.balance;
                if (daysOverdue <= 30) bucket30 += t.balance;
                else if (daysOverdue <= 60) bucket60 += t.balance;
                else if (daysOverdue <= 90) bucket90 += t.balance;
                else bucket90Plus += t.balance;
            } else {
                carteraSana += t.balance;
            }
            
            if (!clientsWithDebt[t.client]) {
                clientsWithDebt[t.client] = { client: t.client, document: t.document, totalDebt: 0, status: 'PAGADO', daysOverdue: 0, latestDue: t.dueDate || t.date };
            }
            clientsWithDebt[t.client].totalDebt += t.balance;
            
            if (daysOverdue > clientsWithDebt[t.client].daysOverdue) {
                clientsWithDebt[t.client].daysOverdue = daysOverdue;
                clientsWithDebt[t.client].status = daysOverdue > 0 ? 'MORA' : 'AL_DIA';
            }
        });

        const chartData = [
            { name: '< 30 Días', Valor: bucket30 },
            { name: '31-60 Días', Valor: bucket60 },
            { name: '61-90 Días', Valor: bucket90 },
            { name: '> 90 Días', Valor: bucket90Plus },
        ];

        return {
            carteraTotal, carteraMora, carteraSana,
            chartData,
            clientList: Object.values(clientsWithDebt).filter(c => c.totalDebt > 0).sort((a,b) => b.totalDebt - a.totalDebt)
        };
    }, [transactions]);

    const cierreData = useMemo(() => {
        const now = new Date();
        const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            if (cierreTimeRange === 'HOY') {
                return d.toDateString() === now.toDateString();
            } else if (cierreTimeRange === 'ESTA_SEMANA') {
                return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000;
            } else if (cierreTimeRange === 'ESTE_MES') {
                return (now.getTime() - d.getTime()) <= 30 * 24 * 60 * 60 * 1000;
            } else if (cierreTimeRange === 'ESTE_AÑO') {
                return d.getFullYear() === now.getFullYear();
            } else if (cierreTimeRange === 'PERSONALIZADO') {
                if (cierreDateFrom && t.date < cierreDateFrom) return false;
                if (cierreDateTo && t.date > cierreDateTo) return false;
                return true;
            } else {
                return d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1);
            }
        });

        let totalEfectivo = 0;
        let totalBancos = 0;
        let totalIVA = 0;
        let totalCOGS = 0;
        let totalVentas = 0;
        const paymentMethodBreakdown: Record<string, number> = {};

        const chartMap: Record<string, { date: string; Efectivo: number; Bancos: number }> = {};

        filtered.forEach(t => {
            if (t.type === 'VENTA') {
                totalVentas += t.total;
                totalIVA += t.iva;
                
                const method = t.paymentMethod || 'Otros';
                if (!paymentMethodBreakdown[method]) {
                    paymentMethodBreakdown[method] = 0;
                }
                paymentMethodBreakdown[method] += t.total;
                
                // Calcular COGS real cruzando con el inventario
                const product = inventory.find(p => p.sku === t.sku);
                if (product && t.qty) {
                    totalCOGS += product.unitCost * t.qty;
                } else {
                    totalCOGS += t.total * 0.68; // Fallback por si es un producto sin SKU o sin costo
                }

                const isEfectivo = t.paymentMethod?.toLowerCase().includes('efectivo');
                if (isEfectivo) totalEfectivo += t.total;
                else totalBancos += t.total;

                if (!chartMap[t.date]) {
                    chartMap[t.date] = { date: t.date, Efectivo: 0, Bancos: 0 };
                }
                if (isEfectivo) chartMap[t.date].Efectivo += t.total;
                else chartMap[t.date].Bancos += t.total;
            }
        });

        return {
            totalVentas, totalEfectivo, totalBancos, totalIVA, totalCOGS, paymentMethodBreakdown,
            chartData: Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date))
        };
    }, [transactions, cierreTimeRange, inventory, cierreDateFrom, cierreDateTo]);

    const handleCxPPaymentSubmit = () => {
        if (!selectedCxPInvoice || !cxPPaymentAmount) return;
        const amountNum = parseFloat(cxPPaymentAmount) || 0;
        if (amountNum <= 0) return;

        const docId = `CE-${selectedCxPInvoice.invoiceId}`;
        addTransaction({
            id: docId,
            date: cxPPaymentDate,
            type: 'COMPRA',
            client: selectedCxPInvoice.provider,
            document: selectedCxPInvoice.document,
            productName: `Pago a Proveedor - Fra: ${selectedCxPInvoice.invoiceId}`,
            sku: 'PAGO-PROV',
            qty: 1,
            total: amountNum,
            iva: 0,
            paymentMethod: cxPPaymentMethod as any,
            posLocation: 'Bodega Central'
        });

        setCxPData(prev => {
            const updatedList = prev.providerList.map(p => {
                if (p.provider === selectedCxPInvoice.provider) {
                    const newBal = Math.max(0, p.balance - amountNum);
                    return {
                        ...p,
                        balance: newBal,
                        status: newBal === 0 ? 'PAGADO' : p.status
                    };
                }
                return p;
            }).filter(p => p.balance > 0);

            const newTotal = updatedList.reduce((acc, curr) => acc + curr.balance, 0);
            const newVencido = updatedList.filter(u => u.status === 'VENCIDO').reduce((acc, curr) => acc + curr.balance, 0);
            const newAlDia = updatedList.filter(u => u.status === 'AL_DIA').reduce((acc, curr) => acc + curr.balance, 0);

            return {
                totalPagar: newTotal,
                pagarVencido: newVencido,
                pagarAlDia: newAlDia,
                providerList: updatedList
            };
        });

        setShowCxPPaymentModal(false);
        setSelectedCxPInvoice(null);
    };

    const handleExportExcel = () => {
        // Hoja 1: Sábana General
        const dataForExport = filteredSabana.map(t => ({
            'Fecha': t.date,
            'Documento': t.id,
            'Tipo': t.type,
            'Tercero': t.client,
            'NIT/CC': t.document,
            'Concepto (SKU)': t.sku,
            'Producto': t.productName,
            'Familia': t.family || 'N/A',
            'Categoría': t.category || 'N/A',
            'Cantidad': t.qty,
            'Valor Total ($)': t.total,
            'IVA ($)': t.iva,
            'Punto de Venta': t.posLocation || 'N/A',
            'Forma de Pago': t.paymentMethod || 'N/A'
        }));
        const wsSabana = XLSX.utils.json_to_sheet(dataForExport);

        // Hoja 2: Cartera Activa
        const carteraExport = carteraData.clientList.map(c => ({
            'Cliente': c.client,
            'NIT/CC': c.document,
            'Estado': c.status,
            'Días de Mora': c.daysOverdue,
            'Total Adeudado ($)': c.totalDebt,
            'Último Vencimiento': c.latestDue
        }));
        const wsCartera = XLSX.utils.json_to_sheet(carteraExport.length ? carteraExport : [{'Info': 'No hay cartera activa'}]);

        // Hoja 3: Cierre Valorizado
        const cierreExport = [{
            'Periodo': cierreTimeRange,
            'Total Ventas ($)': cierreData.totalVentas,
            'Total Efectivo ($)': cierreData.totalEfectivo,
            'Total Bancos/Tarjetas ($)': cierreData.totalBancos,
            'Total IVA Recaudado ($)': cierreData.totalIVA,
            'Costo Mercancía (COGS) ($)': cierreData.totalCOGS,
            'Margen Bruto ($)': cierreData.totalVentas - cierreData.totalCOGS
        }];
        const wsCierre = XLSX.utils.json_to_sheet(cierreExport);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsSabana, "Sábana General");
        XLSX.utils.book_append_sheet(wb, wsCartera, "Cartera Activa");
        XLSX.utils.book_append_sheet(wb, wsCierre, "Inventario Valorizado");
        
        XLSX.writeFile(wb, `Reporte_Contable_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportSabana = handleExportExcel;

    const handleExportZReport = () => {
        alert('📧 Reporte Z enviado exitosamente a contabilidad@empresa.com');
        const ws = XLSX.utils.json_to_sheet([{
            'Periodo': cierreTimeRange,
            'Total Ventas ($)': cierreData.totalVentas,
            'Total Efectivo ($)': cierreData.totalEfectivo,
            'Total Bancos/Tarjetas ($)': cierreData.totalBancos,
            'Total IVA Recaudado ($)': cierreData.totalIVA,
            'Costo Mercancía (COGS) ($)': cierreData.totalCOGS,
            'Margen Bruto ($)': cierreData.totalVentas - cierreData.totalCOGS
        }]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Z-Report");
        XLSX.writeFile(wb, `Z-Report_${cierreTimeRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // --- TAB 4: AUDITORÍA TERCEROS ---
    const invalidContacts = useMemo(() => {
        return contacts.filter(c => !c.documentNumber || c.documentNumber.trim() === '');
    }, [contacts]);

    // --- TAB 5: INVENTARIO VALORIZADO ---
    const inventarioValorizado = useMemo(() => {
        let totalCosto = 0;
        const items = inventory.map(p => {
            const val = p.totalStock * p.unitCost;
            totalCosto += val;
            return { ...p, valorTotal: val };
        });
        return { items, totalCosto };
    }, [inventory]);

    // --- TAB 6: EXPORTACIÓN SIIGO ---
    const handleExportSIIGO = () => {
        // 1. Plantilla de Ventas
        const ventasData = soloVentas.map(v => ({
            'Tipo Comprobante': 'FV',
            'Consecutivo': v.id,
            'Fecha': v.date,
            'Cliente': v.client,
            'Base Imponible': v.total - v.iva,
            'IVA': v.iva,
            'Total': v.total,
            'Forma de Pago': v.paymentMethod
        }));
        
        // 2. Plantilla de Terceros
        const tercerosData = contacts.map(c => ({
            'Tipo Documento': c.documentType || 'NIT',
            'Numero Documento': c.documentNumber || 'FALTA_NIT',
            'Razon Social': c.company || c.name,
            'Nombre Comercial': c.name,
            'Direccion': 'No Especificada',
            'Ciudad': 'Bogota',
            'Telefono': c.phone,
            'Email': c.email
        }));

        // 3. Plantilla de Caja Menor (Egresos y Compras)
        const cajaMenorMovs = transactions.filter(t => t.paymentMethod === 'Caja Menor');
        const cajaMenorData = cajaMenorMovs.map(m => ({
            'Tipo Comprobante': m.type === 'PAGO_RECIBIDO' ? 'RC' : 'CE', // RC = Recibo de Caja (Ingreso), CE = Comprobante Egreso (Gasto)
            'Consecutivo': m.id,
            'Fecha': m.date,
            'Beneficiario / Tercero': m.client,
            'Concepto / Producto': m.productName,
            'SKU': m.sku || 'N/A',
            'Cantidad': m.qty || 1,
            'Total': m.total,
            'Cuenta Contable': m.sku && m.sku !== 'N/A' ? '143505 (Inventario Empaques)' : '519595 (Diversos/Papelería/Cafetería)'
        }));

        const wb = XLSX.utils.book_new();
        const wsVentas = XLSX.utils.json_to_sheet(ventasData);
        const wsTerceros = XLSX.utils.json_to_sheet(tercerosData);
        const wsCajaMenor = XLSX.utils.json_to_sheet(cajaMenorData);
        
        XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas_SIIGO");
        XLSX.utils.book_append_sheet(wb, wsTerceros, "Terceros_SIIGO");
        XLSX.utils.book_append_sheet(wb, wsCajaMenor, "Caja_Menor_SIIGO");
        
        XLSX.writeFile(wb, `Exportacion_SIIGO_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Top Navigation Bar - 5 Core Operational Modules */}
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-sm shrink-0 z-20">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {TABS_CONFIG.map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(`/accounting/${tab.id}`)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>5 Módulos Operativos</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {/* 1. CIERRES DE CAJA (Z-REPORT) */}
                        {activeTab === 'cierres' && (
                            <CierresTab 
                                cierreTimeRange={cierreTimeRange}
                                setCierreTimeRange={setCierreTimeRange}
                                cierreDateFrom={cierreDateFrom}
                                setCierreDateFrom={setCierreDateFrom}
                                showZReport={showZReport}
                                setShowZReport={setShowZReport}
                                handleExportZReport={handleExportZReport}
                                cierreDateTo={cierreDateTo}
                                setCierreDateTo={setCierreDateTo}
                                cierreData={cierreData}
                            />
                        )}

                        {/* 2. CAJA MENOR */}
                        {activeTab === 'caja_menor' && (
                            <CajaMenorTab 
                                transactions={transactions}
                            />
                        )}

                        {/* 3. CONCILIACIÓN DATÁFONOS Y BANCOS */}
                        {activeTab === 'conciliacion_datafono' && (
                            <ConciliacionDatafonoTab 
                                transactions={transactions}
                                reconcileDatáfonoTransaction={reconcileDatáfonoTransaction}
                            />
                        )}

                        {/* 4. SÁBANA OPERATIVA */}
                        {activeTab === 'sabana' && (
                            <SabanaTab 
                                draftFilters={draftFilters}
                                setDraftFilters={setDraftFilters}
                                appliedFilters={appliedFilters}
                                setAppliedFilters={setAppliedFilters}
                                showFilters={showFilters}
                                setShowFilters={setShowFilters}
                                setShowExcelModal={setShowExcelModal}
                                handleExportExcel={handleExportExcel}
                                handleExportSabana={handleExportSabana}
                                activeShortcutFilter={activeShortcutFilter}
                                setActiveShortcutFilter={setActiveShortcutFilter}
                                accountingShortcuts={accountingShortcuts}
                                initialFilterState={initialFilterState}
                                filteredSabana={filteredSabana}
                            />
                        )}

                        {/* 5. SINCRONIZACIÓN SIIGO & DIAN (MONITOR ASÍNCRONO) */}
                        {activeTab === 'siigo_sync' && (
                            <SiigoSyncTab 
                                transactions={transactions}
                                contacts={contacts}
                                handleExportSIIGO={handleExportSIIGO}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <TransactionsExcelModal 
                isOpen={showExcelModal} 
                onClose={() => setShowExcelModal(false)} 
                data={filteredSabana} 
            />

            {/* MODAL: REGISTRAR RECIBO DE CAJA */}
            <AnimatePresence>
                {showPaymentModal && paymentClient && (() => {
                    const clientInvoices = transactions.filter(
                        t => t.client === paymentClient.client && t.type === 'VENTA' && t.paymentStatus !== 'PAGADA'
                    );

                    const selectedInvoice = paymentSelectedInvoice || (clientInvoices.length > 0 ? clientInvoices[0] : null);
                    const invoiceTotal = selectedInvoice ? selectedInvoice.total : 0;
                    const paidAmount = Number(paymentAmount) || 0;
                    const diff = invoiceTotal - paidAmount;

                    return (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                                {/* Header */}
                                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
                                    <h3 className="text-base font-black text-white flex items-center gap-2">
                                        <HandCoins className="w-5 h-5 text-indigo-400" />
                                        Registrar Recibo de Caja
                                    </h3>
                                    <button 
                                        onClick={() => setShowPaymentModal(false)} 
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente / Tercero</label>
                                        <div className="text-sm font-black text-slate-800 mt-0.5">{paymentClient.client}</div>
                                        <div className="text-[10px] text-slate-500 font-semibold">Nit: {paymentClient.document}</div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Factura de Venta a Cruzar</label>
                                        {clientInvoices.length === 0 ? (
                                            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-xl font-medium">
                                                Este cliente no tiene facturas de venta pendientes en cartera. El pago se registrará como un anticipo a favor.
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedInvoice?.id || ''}
                                                onChange={e => {
                                                    const inv = clientInvoices.find(i => i.id === e.target.value);
                                                    if (inv) setPaymentSelectedInvoice(inv);
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                                            >
                                                {clientInvoices.map(inv => (
                                                    <option key={inv.id} value={inv.id}>
                                                        {inv.id} - ${inv.total.toLocaleString()} ({inv.date})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Fecha de Recaudo</label>
                                            <input
                                                type="date"
                                                value={paymentDate}
                                                onChange={e => setPaymentDate(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Cuenta/Banco Ingreso</label>
                                            <select
                                                value={paymentBank}
                                                onChange={e => setPaymentBank(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                                            >
                                                <option value="Davivienda">Davivienda (111005)</option>
                                                <option value="BBVA">BBVA (111005)</option>
                                                <option value="Caja General">Caja General (110505)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Nro de Referencia / Soporte</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. TRF-902183"
                                            value={paymentRef}
                                            onChange={e => setPaymentRef(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Valor Recibido ($)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="Monto pagado por el cliente"
                                                value={paymentAmount}
                                                onChange={e => setPaymentAmount(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm font-black text-slate-900 focus:ring-1 focus:ring-indigo-500"
                                            />
                                            {selectedInvoice && (
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentAmount(invoiceTotal.toString())}
                                                    className="absolute right-2 top-2 text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded"
                                                >
                                                    Pagar Todo
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Difference handling interface */}
                                    {selectedInvoice && paidAmount > 0 && diff !== 0 && (
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                                                El pago no coincide exactamente
                                            </div>
                                            
                                            {diff > 0 ? (
                                                <div className="space-y-2">
                                                    <p className="text-[11px] text-slate-600">
                                                        El cliente pagó <strong>${paidAmount.toLocaleString()}</strong> de una factura de <strong>${invoiceTotal.toLocaleString()}</strong>. Falta un saldo de <strong>${diff.toLocaleString()}</strong>.
                                                    </p>
                                                    <div className="flex flex-col gap-2 pt-1">
                                                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="diff-handle"
                                                                checked={paymentDiffHandling === 'PARTIAL'}
                                                                onChange={() => setPaymentDiffHandling('PARTIAL')}
                                                                className="text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            Abono Parcial (Factura sigue abierta)
                                                        </label>
                                                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="diff-handle"
                                                                checked={paymentDiffHandling === 'DISCOUNT'}
                                                                onChange={() => setPaymentDiffHandling('DISCOUNT')}
                                                                className="text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            Descuento Financiero / Ajuste (Cerrar factura, llevar a gasto 530595)
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="text-[11px] text-slate-600">
                                                        El cliente pagó un excedente de <strong>${Math.abs(diff).toLocaleString()}</strong>.
                                                    </p>
                                                    <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                                                        Se acreditará el excedente como un anticipo a favor del cliente para futuros cruces de cartera.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Register the payment received
                                            addTransaction({
                                                id: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
                                                date: paymentDate,
                                                type: 'PAGO_RECIBIDO',
                                                client: paymentClient.client,
                                                document: paymentRef || 'RC-UNIFICADO',
                                                productName: selectedInvoice 
                                                    ? `Recibo de Caja - Pago Fac: ${selectedInvoice.id} (${paymentDiffHandling === 'DISCOUNT' ? 'Ajustado' : 'Abono'})`
                                                    : 'Recibo de Caja - Anticipo a Favor',
                                                sku: 'N/A',
                                                qty: 1,
                                                total: paidAmount,
                                                iva: 0,
                                                paymentMethod: paymentBank,
                                                posLocation: selectedInvoice?.posLocation || 'Principal',
                                                paymentStatus: 'PAGADA'
                                            });

                                            // Simular cierre de la factura si fue pagada totalmente o ajustada
                                            if (selectedInvoice) {
                                                if (diff === 0 || paymentDiffHandling === 'DISCOUNT' || diff < 0) {
                                                    selectedInvoice.paymentStatus = 'PAGADA';
                                                    selectedInvoice.balance = 0;
                                                } else {
                                                    selectedInvoice.balance = diff;
                                                }
                                            }

                                            setShowPaymentModal(false);
                                        }}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-100 active:scale-95 transition-all"
                                    >
                                        Confirmar Pago
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </AnimatePresence>

            {/* MODAL: REGISTRAR COMPROBANTE DE EGRESO (PAGO A PROVEEDOR) */}
            <AnimatePresence>
                {showCxPPaymentModal && selectedCxPInvoice && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                            {/* Header */}
                            <div className="bg-rose-900 px-6 py-4 flex justify-between items-center shrink-0">
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <Banknote className="w-5 h-5 text-rose-300" />
                                    Comprobante de Egreso (Pago Proveedor)
                                </h3>
                                <button 
                                    onClick={() => {
                                        setShowCxPPaymentModal(false);
                                        setSelectedCxPInvoice(null);
                                    }} 
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                                    <div className="text-xs font-bold text-rose-800">Proveedor / NIT</div>
                                    <div className="text-sm font-black text-slate-800">{selectedCxPInvoice.provider}</div>
                                    <div className="text-xs text-slate-500 mt-1">{selectedCxPInvoice.document}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Factura de Compra</label>
                                        <input
                                            type="text"
                                            value={selectedCxPInvoice.invoiceId}
                                            disabled
                                            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold font-mono text-slate-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Fecha de Pago</label>
                                        <input
                                            type="date"
                                            value={cxPPaymentDate}
                                            onChange={e => setCxPPaymentDate(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-rose-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Medio de Pago</label>
                                        <select
                                            value={cxPPaymentMethod}
                                            onChange={e => setCxPPaymentMethod(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-rose-500"
                                        >
                                            <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                                            <option value="PSE">Pago PSE</option>
                                            <option value="EFECTIVO">Efectivo Caja Menor</option>
                                            <option value="TARJETA_CREDITO">Tarjeta de Crédito Corp.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Valor a Pagar ($)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={cxPPaymentAmount}
                                                onChange={e => setCxPPaymentAmount(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-rose-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => {
                                        setShowCxPPaymentModal(false);
                                        setSelectedCxPInvoice(null);
                                    }}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCxPPaymentSubmit}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-100 active:scale-95 transition-all"
                                >
                                    Confirmar Egreso
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: CONTABILIZAR FACTURA PROVEEDOR CON IA */}
            <AnimatePresence>
                {showAiFormModal && selectedEmail && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-slate-200 max-h-[90vh]">
                            {/* Header */}
                            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-indigo-400" />
                                    Lectura & Contabilización de Factura (IA)
                                </h3>
                                <button 
                                    onClick={() => setShowAiFormModal(false)} 
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div className="text-xs text-indigo-800 bg-indigo-50 border border-indigo-100 p-3 rounded-xl font-medium">
                                    El Copiloto IA ha leído el documento soporte XML. Por favor verifica que los campos sean exactos antes de asentar contablemente la compra.
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Razón Social del Proveedor</label>
                                        <input
                                            type="text"
                                            value={aiProvider}
                                            onChange={e => setAiProvider(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">NIT Proveedor</label>
                                            <input
                                                type="text"
                                                value={aiNit}
                                                onChange={e => setAiNit(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Nro Factura</label>
                                            <input
                                                type="text"
                                                value={aiInvoiceId}
                                                onChange={e => setAiInvoiceId(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Fecha Emisión</label>
                                            <input
                                                type="date"
                                                value={aiDate}
                                                onChange={e => setAiDate(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Concepto / Glosa</label>
                                            <input
                                                type="text"
                                                value={aiItems}
                                                onChange={e => setAiItems(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">Subtotal ($)</label>
                                            <input
                                                type="number"
                                                value={aiSubtotal}
                                                onChange={e => setAiSubtotal(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">IVA ($)</label>
                                            <input
                                                type="number"
                                                value={aiIva}
                                                onChange={e => setAiIva(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-500 mb-1">Total ($)</label>
                                            <input
                                                type="number"
                                                value={aiTotal}
                                                onChange={e => setAiTotal(e.target.value)}
                                                className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-1.5 text-xs font-mono font-black text-indigo-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setShowAiFormModal(false)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        // Add to accounting transactions list
                                        addTransaction({
                                            id: aiInvoiceId,
                                            date: aiDate,
                                            type: 'COMPRA',
                                            client: aiProvider,
                                            document: aiNit,
                                            productName: `[Proveedor] ${aiItems}`,
                                            sku: 'N/A',
                                            qty: 1,
                                            total: Number(aiTotal) || 0,
                                            iva: Number(aiIva) || 0,
                                            paymentMethod: 'Transferencia',
                                            posLocation: 'Bodega Principal',
                                            paymentStatus: 'PAGADA'
                                        });

                                        // Update email status to processed
                                        setEmails(prev => prev.map(em => em.id === selectedEmail.id ? { ...em, status: 'PROCESADA' } : em));
                                        if (selectedEmail) {
                                            selectedEmail.status = 'PROCESADA';
                                        }

                                        setShowAiFormModal(false);
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-100 active:scale-95 transition-all"
                                >
                                    Contabilizar Factura
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
