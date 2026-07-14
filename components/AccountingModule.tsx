import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Calculator, FileSpreadsheet, Download, AlertTriangle, 
    CheckCircle2, DollarSign, PackageOpen, TableProperties,
    Calendar, Filter, Search, ArrowRight, UserCheck, Mail, Send, CreditCard, Banknote, Wallet, HandCoins, UploadCloud, Landmark, X, BrainCircuit
} from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { AccountingTransaction } from '../types';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ImportInvoicesPanel } from './ImportInvoicesPanel';
import { TransactionsExcelModal } from './TransactionsExcelModal';
import { formatCOP } from '../utils/format';

export const AccountingModule: React.FC = () => {
    const { inventory, contacts, paymentMethods, pointsOfSale, transactions, accountingShortcuts, reconcileDatáfonoTransaction, addTransaction, updateInventoryStock, auditReports, runAuditAction } = useEnterprise();
    const { tabId } = useParams<{ tabId: string }>();

    // Valid tabs
    const validTabs = ['sabana', 'activos_liquidez', 'cierres', 'ventas', 'auditoria', 'exportacion', 'importaciones', 'facturas_correo', 'conciliacion_datafono', 'caja_menor'];
    if (!tabId || !validTabs.includes(tabId)) {
        return <Navigate to="/accounting/sabana" replace />;
    }

    const activeTab = tabId as 'sabana' | 'activos_liquidez' | 'cierres' | 'ventas' | 'auditoria' | 'exportacion' | 'importaciones' | 'facturas_correo' | 'conciliacion_datafono' | 'caja_menor';

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
    const [cierreTimeRange, setCierreTimeRange] = useState<'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'MES_PASADO' | 'ESTE_AÑO'>('ESTE_MES');

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

    // --- DATÁFONO RECONCILIATION STATE ---
    const [bankTransactions, setBankTransactions] = useState<any[]>([]);
    const [saleSearch, setSaleSearch] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [bankFileName, setBankFileName] = useState('');
    const [activeValidationSale, setActiveValidationSale] = useState<AccountingTransaction | null>(null);
    const [bankAmountInput, setBankAmountInput] = useState('');
    const [bankFeeInput, setBankFeeInput] = useState('');
    const [reconciledList, setReconciledList] = useState<any[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // --- NUEVO: REGISTRO DE RECIBOS DE CAJA (PAGOS DE CLIENTES) ---
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentClient, setPaymentClient] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentBank, setPaymentBank] = useState('Davivienda');
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentSelectedInvoice, setPaymentSelectedInvoice] = useState<AccountingTransaction | null>(null);
    const [paymentDiffHandling, setPaymentDiffHandling] = useState<'PARTIAL' | 'DISCOUNT' | 'ADVANCE'>('PARTIAL');

    // --- EXTENSIÓN CONCILIACIÓN BANCARIA ---
    const [reconciliationType, setReconciliationType] = useState<'DATAFONO' | 'DAVIVIENDA' | 'BBVA'>('DATAFONO');
    const [reteFuenteInput, setReteFuenteInput] = useState('0');
    const [reteIvaInput, setReteIvaInput] = useState('0');
    const [reteIcaInput, setReteIcaInput] = useState('0');

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

    // --- CAJA MENOR STATE ---
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
    const suggestedMatches = useMemo(() => {
        if (bankTransactions.length === 0) return new Map<string, any>();
        
        const matches = new Map<string, any>();
        const pendingSales = transactions.filter(t => t.type === 'VENTA' && t.paymentMethod.includes('Datáfonos') && t.validationStatus === 'PENDIENTE_VALIDACION');
        
        pendingSales.forEach(sale => {
            const saleDate = new Date(sale.date);
            // Buscar un depósito en el banco que haya sido en fechas cercanas (+/- 4 días) y con valor entre 90% y 100% de la venta
            const match = bankTransactions.find(b => {
                const bankDate = new Date(b.date);
                const dateDiffDays = Math.abs(saleDate.getTime() - bankDate.getTime()) / (1000 * 60 * 60 * 24);
                const ratio = b.amount / sale.total;
                return dateDiffDays <= 4 && ratio >= 0.90 && ratio <= 1.0;
            });
            
            if (match) {
                matches.set(sale.id, match);
            }
        });
        
        return matches;
    }, [bankTransactions, transactions]);

    // Llenar datos al abrir el modal de validación
    useEffect(() => {
        if (activeValidationSale) {
            const suggestion = suggestedMatches.get(activeValidationSale.id);
            if (suggestion) {
                setBankAmountInput(suggestion.amount.toString());
                setBankFeeInput((activeValidationSale.total - suggestion.amount).toString());
            } else {
                const defaultNet = Math.round(activeValidationSale.total * 0.97);
                setBankAmountInput(defaultNet.toString());
                setBankFeeInput((activeValidationSale.total - defaultNet).toString());
            }
        } else {
            setBankAmountInput('');
            setBankFeeInput('');
        }
    }, [activeValidationSale, suggestedMatches]);


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
            } else {
                return d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1);
            }
        });

        let totalEfectivo = 0;
        let totalBancos = 0;
        let totalIVA = 0;
        let totalCOGS = 0;
        let totalVentas = 0;

        const chartMap: Record<string, { date: string; Efectivo: number; Bancos: number }> = {};

        filtered.forEach(t => {
            if (t.type === 'VENTA') {
                totalVentas += t.total;
                totalIVA += t.iva;
                totalCOGS += t.total * 0.68; // Estimating COGS as 68% for the mock

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
            totalVentas, totalEfectivo, totalBancos, totalIVA, totalCOGS,
            chartData: Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date))
        };
    }, [transactions, cierreTimeRange]);

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
        <div className="h-full flex flex-col bg-slate-50">

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        
                        {/* TAB 1: SABANA GENERAL */}
                        {activeTab === 'sabana' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-lg font-bold text-slate-800">Sábana de Movimientos</h2>
                                            
                                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                                <button
                                                    onClick={() => setActiveShortcutFilter('Todos')}
                                                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeShortcutFilter === 'Todos' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Todos
                                                </button>
                                                {accountingShortcuts?.map(shortcut => (
                                                    <button
                                                        key={shortcut}
                                                        onClick={() => setActiveShortcutFilter(shortcut)}
                                                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeShortcutFilter === shortcut ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        {shortcut}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowFilters(!showFilters)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${showFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                <Filter className="w-4 h-4" /> Filtros {showFilters ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                            <button 
                                                onClick={() => setShowExcelModal(true)}
                                                className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition"
                                                title="Ver movimientos en cuadrícula densa tipo Excel"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" /> Ver en Excel
                                            </button>
                                            <button 
                                                onClick={handleExportExcel}
                                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition"
                                            >
                                                <Download className="w-4 h-4" /> Excel
                                            </button>
                                        </div>
                                    </div>

                                    {/* FILTERS UI */}
                                    <AnimatePresence>
                                        {showFilters && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Fechas</label>
                                                        <div className="flex gap-2">
                                                            <input type="date" value={draftFilters.dateFrom} onChange={e => setDraftFilters({...draftFilters, dateFrom: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                            <input type="date" value={draftFilters.dateTo} onChange={e => setDraftFilters({...draftFilters, dateTo: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Comprobante</label>
                                                        <select value={draftFilters.type} onChange={e => setDraftFilters({...draftFilters, type: e.target.value as 'ALL' | 'VENTA' | 'COMPRA' | 'AJUSTE_MERMA'})} className="w-full text-sm border-slate-200 rounded-lg">
                                                            <option value="ALL">Todos</option>
                                                            <option value="VENTA">Ventas (Facturas)</option>
                                                            <option value="COMPRA">Compras (Albaranes)</option>
                                                            <option value="AJUSTE_MERMA">Ajustes / Mermas</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tercero (NIT o Nombre)</label>
                                                        <input type="text" placeholder="Buscar..." value={draftFilters.tercero} onChange={e => setDraftFilters({...draftFilters, tercero: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Documento (ID)</label>
                                                        <input type="text" placeholder="Ej. FV-001" value={draftFilters.documento} onChange={e => setDraftFilters({...draftFilters, documento: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Rango de Valor ($)</label>
                                                        <div className="flex gap-2">
                                                            <input type="number" placeholder="Min" value={draftFilters.minAmount} onChange={e => setDraftFilters({...draftFilters, minAmount: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                            <input type="number" placeholder="Max" value={draftFilters.maxAmount} onChange={e => setDraftFilters({...draftFilters, maxAmount: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Concepto / SKU Producto</label>
                                                        <input type="text" placeholder="Buscar por código de pintura o nombre..." value={draftFilters.concepto} onChange={e => setDraftFilters({...draftFilters, concepto: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-end justify-end gap-2 lg:col-span-4">
                                                        <button 
                                                            onClick={() => {
                                                                setDraftFilters(initialFilterState);
                                                                setAppliedFilters(initialFilterState);
                                                            }}
                                                            className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2"
                                                        >
                                                            Limpiar
                                                        </button>
                                                        <button 
                                                            onClick={() => setAppliedFilters(draftFilters)}
                                                            className="bg-indigo-600 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                                                        >
                                                            Aplicar Filtros
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
                                    <div className="h-full overflow-y-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                                <tr>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Fecha</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Documento</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Tipo</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Tercero</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Concepto (SKU)</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">POS / Forma Pago</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 text-right">Valor ($)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredSabana.map((t, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="p-3 text-sm text-slate-600">{t.date}</td>
                                                        <td className="p-3 font-bold text-sm text-slate-800">{t.id}</td>
                                                        <td className="p-3">
                                                            <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                                                                t.type === 'VENTA' ? 'bg-emerald-100 text-emerald-700' :
                                                                t.type === 'COMPRA' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-rose-100 text-rose-700'
                                                            }`}>
                                                                {t.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="text-sm font-bold text-slate-800">{t.client}</div>
                                                            <div className="text-[10px] text-slate-500">{t.document}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="text-sm text-slate-600">{t.qty}x {t.sku}</div>
                                                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{t.productName}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="text-[11px] font-bold text-indigo-700">{t.posLocation}</div>
                                                            <div className="text-[10px] font-medium text-slate-500">{t.paymentMethod}</div>
                                                        </td>
                                                        <td className="p-3 text-sm font-bold text-slate-800 text-right">
                                                            ${t.total.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: ACTIVOS & LIQUIDEZ (CARTERA E INVENTARIO CONSOLIDADO) */}
                        {activeTab === 'activos_liquidez' && (() => {
                            const filteredInventoryItems = inventarioValorizado.items.filter(item => {
                                if (!inventorySearchQuery) return true;
                                const q = inventorySearchQuery.toLowerCase();
                                return item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
                            });
                            const filteredInventoryTotal = filteredInventoryItems.reduce((sum, item) => sum + item.valorTotal, 0);

                            return (
                                <div className="space-y-6 flex flex-col h-full overflow-hidden">
                                    {/* Consolidado de Activos Líquidos KPI Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                <HandCoins className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Cartera Cobrar (AR)</p>
                                                <p className="text-base font-black text-slate-800">{formatCOP(carteraData.carteraTotal)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                                <Banknote className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Cuentas por Pagar (AP)</p>
                                                <p className="text-base font-black text-slate-800">{formatCOP(cxPData.totalPagar)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                                <PackageOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Inventario Valorizado</p>
                                                <p className="text-base font-black text-slate-800">{formatCOP(inventarioValorizado.totalCosto)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Pasivo Vencido (Mora)</p>
                                                <p className="text-base font-black text-amber-700">{formatCOP(cxPData.pagarVencido)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md flex items-center gap-3">
                                            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl">
                                                <Landmark className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-indigo-200 uppercase">Capital Neto Corriente</p>
                                                <p className="text-base font-black text-white">
                                                    {formatCOP(carteraData.carteraTotal + inventarioValorizado.totalCosto - cxPData.totalPagar)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Split View Grid */}
                                    <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
                                        {/* Left: Accounts Receivable or Accounts Payable List (7 cols) */}
                                        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col min-h-0">
                                            <div className="flex justify-between items-center mb-3 shrink-0">
                                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                                                    {leftPanelMode === 'AR' ? (
                                                        <>
                                                            <HandCoins className="w-4 h-4 text-indigo-600" />
                                                            Cartera de Clientes & Cuentas por Cobrar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Banknote className="w-4 h-4 text-rose-600" />
                                                            Cuentas por Pagar a Proveedores
                                                        </>
                                                    )}
                                                </h3>
                                                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                                    <button 
                                                        onClick={() => setLeftPanelMode('AR')}
                                                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${leftPanelMode === 'AR' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        Cuentas por Cobrar (AR)
                                                    </button>
                                                    <button 
                                                        onClick={() => setLeftPanelMode('AP')}
                                                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${leftPanelMode === 'AP' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        Cuentas por Pagar (AP)
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto">
                                                {leftPanelMode === 'AR' ? (
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 z-10">
                                                            <tr className="border-b border-slate-200">
                                                                <th className="p-3">Cliente</th>
                                                                <th className="p-3">Estado</th>
                                                                <th className="p-3 text-right">Saldo Pendiente</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {carteraData.clientList.map((c, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    <tr 
                                                                        className="hover:bg-slate-50 cursor-pointer transition"
                                                                        onClick={() => setExpandedCarteraClient(expandedCarteraClient === c.client ? null : c.client)}
                                                                    >
                                                                        <td className="p-3 font-bold text-sm text-slate-800">{c.client}</td>
                                                                        <td className="p-3">
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                                                                                c.status === 'MORA' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                                            }`}>
                                                                                {c.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-3 text-sm font-black text-slate-900 text-right">{formatCOP(c.totalDebt)}</td>
                                                                    </tr>
                                                                    {expandedCarteraClient === c.client && (
                                                                        <tr>
                                                                            <td colSpan={3} className="p-0 border-b border-slate-200">
                                                                                <div className="bg-slate-50 p-4 border-l-4 border-indigo-500 shadow-inner">
                                                                                    <div className="flex justify-between items-center mb-3">
                                                                                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                                                            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                                                                                            Estado de Cuenta
                                                                                        </h4>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setPaymentClient(c);
                                                                                                setPaymentAmount('');
                                                                                                setPaymentRef('');
                                                                                                setPaymentSelectedInvoice(null);
                                                                                                setShowPaymentModal(true);
                                                                                            }}
                                                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition active:scale-95"
                                                                                        >
                                                                                            <HandCoins className="w-3 h-3" /> Registrar Recibo
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="overflow-x-auto text-[11px]">
                                                                                        <table className="w-full text-left bg-white rounded border border-slate-200 shadow-sm">
                                                                                            <thead className="bg-slate-100 border-b border-slate-200">
                                                                                                <tr>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Fecha</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Documento</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Tipo</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500 text-right">Valor</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody className="divide-y divide-slate-100">
                                                                                                {transactions
                                                                                                    .filter(t => t.client === c.client && ['VENTA', 'PAGO_RECIBIDO', 'NOTA_CREDITO'].includes(t.type))
                                                                                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                                                                                    .map((t, tIdx) => (
                                                                                                        <tr key={tIdx}>
                                                                                                            <td className="p-2 font-medium text-slate-500">{t.date}</td>
                                                                                                            <td className="p-2 font-mono font-bold text-slate-700">{t.id}</td>
                                                                                                            <td className="p-2 font-bold text-slate-600">{t.type === 'VENTA' ? 'Factura Venta' : 'Recibo Caja'}</td>
                                                                                                            <td className={`p-2 text-right font-black ${t.type === 'VENTA' ? 'text-slate-800' : 'text-emerald-600'}`}>
                                                                                                                {t.type === 'VENTA' ? '' : '-'}{formatCOP(t.total)}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    ))}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 z-10">
                                                            <tr className="border-b border-slate-200">
                                                                <th className="p-3">Proveedor</th>
                                                                <th className="p-3">Estado</th>
                                                                <th className="p-3 text-right">Saldo Pendiente</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {cxPData.providerList.map((p, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    <tr 
                                                                        className="hover:bg-slate-50 cursor-pointer transition"
                                                                        onClick={() => setExpandedCarteraClient(expandedCarteraClient === p.provider ? null : p.provider)}
                                                                    >
                                                                        <td className="p-3">
                                                                            <div className="font-bold text-sm text-slate-800">{p.provider}</div>
                                                                            <div className="text-[10px] text-slate-400 font-mono">{p.document}</div>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                                                                                p.status === 'VENCIDO' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                                            }`}>
                                                                                {p.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-3 text-sm font-black text-slate-900 text-right">{formatCOP(p.balance)}</td>
                                                                    </tr>
                                                                    {expandedCarteraClient === p.provider && (
                                                                        <tr>
                                                                            <td colSpan={3} className="p-0 border-b border-slate-200">
                                                                                <div className="bg-slate-50 p-4 border-l-4 border-rose-500 shadow-inner">
                                                                                    <div className="flex justify-between items-center mb-3">
                                                                                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                                                            <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
                                                                                            Facturas y Cuentas de Cobro Pendientes
                                                                                        </h4>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setSelectedCxPInvoice(p);
                                                                                                setCxPPaymentAmount(p.balance.toString());
                                                                                                setShowCxPPaymentModal(true);
                                                                                            }}
                                                                                            className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition active:scale-95"
                                                                                        >
                                                                                            <Banknote className="w-3 h-3" /> Registrar Pago
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="overflow-x-auto text-[11px]">
                                                                                        <table className="w-full text-left bg-white rounded border border-slate-200 shadow-sm">
                                                                                            <thead className="bg-slate-100 border-b border-slate-200">
                                                                                                <tr>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Vencimiento</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Factura / Cuenta</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Días Restantes</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500 text-right">Saldo</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody className="divide-y divide-slate-100">
                                                                                                <tr>
                                                                                                    <td className="p-2 font-medium text-slate-500">{p.dueDate}</td>
                                                                                                    <td className="p-2 font-mono font-bold text-slate-700">{p.invoiceId}</td>
                                                                                                    <td className="p-2 font-bold text-slate-600">
                                                                                                        {(() => {
                                                                                                            const diffTime = new Date(p.dueDate).getTime() - new Date().getTime();
                                                                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                                                                            return diffDays > 0 ? `${diffDays} días` : `Vencido hace ${Math.abs(diffDays)} días`;
                                                                                                        })()}
                                                                                                    </td>
                                                                                                    <td className="p-2 text-right font-black text-rose-600">
                                                                                                        {formatCOP(p.balance)}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Valued Inventory (5 cols) */}
                                        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col min-h-0">
                                            <div className="flex justify-between items-center mb-2 shrink-0">
                                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                                                    <PackageOpen className="w-4 h-4 text-indigo-600" />
                                                    Valorización de Inventario Físico (Stock)
                                                </h3>
                                                <select
                                                    value={inventorySortBy}
                                                    onChange={e => setInventorySortBy(e.target.value as any)}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] font-bold text-slate-700 outline-none"
                                                >
                                                    <option value="VALOR_DESC">Valor (Mayor a Menor)</option>
                                                    <option value="VALOR_ASC">Valor (Menor a Mayor)</option>
                                                    <option value="STOCK_DESC">Stock (Mayor a Menor)</option>
                                                    <option value="STOCK_ASC">Stock (Menor a Mayor)</option>
                                                    <option value="SKU_ASC">SKU (A-Z)</option>
                                                    <option value="SKU_DESC">SKU (Z-A)</option>
                                                </select>
                                            </div>

                                            {/* Search input and dynamic total */}
                                            <div className="mb-3 flex items-center gap-2 shrink-0">
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs">
                                                    <Search className="w-3.5 h-3.5 text-slate-400" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Buscar SKU o producto..." 
                                                        value={inventorySearchQuery}
                                                        onChange={e => setInventorySearchQuery(e.target.value)}
                                                        className="bg-transparent outline-none w-full font-medium text-slate-700 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap">
                                                    En plata: {formatCOP(filteredInventoryTotal)}
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 z-10">
                                                        <tr className="border-b border-slate-200">
                                                            <th className="p-3">SKU / Producto</th>
                                                            <th className="p-3 text-right">Stock</th>
                                                            <th className="p-3 text-right">Valor Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {[...filteredInventoryItems].sort((a, b) => {
                                                            if (inventorySortBy === 'VALOR_DESC') return b.valorTotal - a.valorTotal;
                                                            if (inventorySortBy === 'VALOR_ASC') return a.valorTotal - b.valorTotal;
                                                            if (inventorySortBy === 'STOCK_DESC') return b.totalStock - a.totalStock;
                                                            if (inventorySortBy === 'STOCK_ASC') return a.totalStock - b.totalStock;
                                                            if (inventorySortBy === 'SKU_ASC') return a.sku.localeCompare(b.sku);
                                                            if (inventorySortBy === 'SKU_DESC') return b.sku.localeCompare(a.sku);
                                                            return 0;
                                                        }).slice(0, 40).map(item => (
                                                            <tr key={item.id} className="hover:bg-slate-50">
                                                                <td className="p-3">
                                                                    <div className="font-bold text-slate-800 font-mono">{item.sku}</div>
                                                                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{item.name}</div>
                                                                </td>
                                                                <td className="p-3 text-right font-semibold text-slate-600">{item.totalStock} {item.baseUnit}</td>
                                                                <td className="p-3 text-right font-black text-slate-800">{formatCOP(item.valorTotal)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="pt-2 text-center text-[10px] text-slate-400 font-medium border-t border-slate-100 shrink-0">
                                                Mostrando top existencias.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}
                        {activeTab === 'cierres' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {['HOY', 'ESTA_SEMANA', 'ESTE_MES', 'MES_PASADO', 'ESTE_AÑO'].map(range => (
                                            <button 
                                                key={range}
                                                onClick={() => setCierreTimeRange(range as any)}
                                                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${cierreTimeRange === range ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {range.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={handleExportZReport}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm active:scale-95"
                                    >
                                        <Send className="w-4 h-4" /> Generar Z-Report
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Ingresos</div>
                                        <div className="text-3xl font-black text-slate-800">${cierreData.totalVentas.toLocaleString('es-CO')}</div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><Banknote className="w-4 h-4" /> Efectivo Recaudado</div>
                                        <div className="text-3xl font-black text-emerald-600">${cierreData.totalEfectivo.toLocaleString('es-CO')}</div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Bancos y Tarjetas</div>
                                        <div className="text-3xl font-black text-blue-600">${cierreData.totalBancos.toLocaleString('es-CO')}</div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><TableProperties className="w-4 h-4" /> IVA Recaudado</div>
                                        <div className="text-3xl font-black text-rose-600">${cierreData.totalIVA.toLocaleString('es-CO')}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <h2 className="text-lg font-bold text-slate-800 mb-6">Composición de Ingresos ({cierreTimeRange.replace('_', ' ')})</h2>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={cierreData.chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748B' }} />
                                                    <Tooltip 
                                                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                    <Bar dataKey="Efectivo" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                                                    <Bar dataKey="Bancos" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 mb-4">Rentabilidad del Periodo</h2>
                                            <div className="space-y-4">
                                                <div className="bg-slate-50 p-4 rounded-xl">
                                                    <div className="text-sm font-semibold text-slate-500">Costo de Mercancía (COGS)</div>
                                                    <div className="text-xl font-black text-slate-700">${cierreData.totalCOGS.toLocaleString('es-CO', {maximumFractionDigits:0})}</div>
                                                </div>
                                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                                    <div className="text-sm font-semibold text-indigo-600">Margen Bruto (Est.)</div>
                                                    <div className="text-2xl font-black text-indigo-700">${(cierreData.totalVentas - cierreData.totalCOGS).toLocaleString('es-CO', {maximumFractionDigits:0})}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-slate-100">
                                            <p className="text-xs text-slate-400 leading-relaxed text-center">
                                                Los valores mostrados representan un pre-cierre. Valide los totales contra los extractos bancarios en el módulo de conciliación.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: VENTAS */}
                        {activeTab === 'ventas' && (
                            <div className="space-y-4">
                                {/* Filters Bar */}
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Método de Pago</label>
                                        <select 
                                            value={salesMethodFilter} 
                                            onChange={e => setSalesMethodFilter(e.target.value)} 
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="ALL">Todos los métodos</option>
                                            {uniqueSalesPaymentMethods.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Desde</label>
                                        <input 
                                            type="date" 
                                            value={salesDateFrom} 
                                            onChange={e => setSalesDateFrom(e.target.value)} 
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Hasta</label>
                                        <input 
                                            type="date" 
                                            value={salesDateTo} 
                                            onChange={e => setSalesDateTo(e.target.value)} 
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="p-4 text-xs font-bold text-slate-500">Comprobante</th>
                                                <th className="p-4 text-xs font-bold text-slate-500">Fecha</th>
                                                <th className="p-4 text-xs font-bold text-slate-500">Cliente</th>
                                                <th className="p-4 text-xs font-bold text-slate-500">Método Pago</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredSales.map(v => (
                                                <tr key={v.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold text-sm text-slate-800">{v.id}</td>
                                                    <td className="p-4 text-sm text-slate-600">{v.date}</td>
                                                    <td className="p-4 text-sm text-slate-600 font-medium">{v.client}</td>
                                                    <td className="p-4"><span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{v.paymentMethod}</span></td>
                                                    <td className="p-4 text-sm font-bold text-emerald-600 text-right">${v.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {filteredSales.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                                                        No se encontraron ventas con los filtros aplicados.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: AUDITORIA TERCEROS */}
                        {/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}
                        {activeTab === 'auditoria' && (
                            <div className="space-y-6">
                                {/* Header / Current Run Info */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                                        <div>
                                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Auto-Auditor Contable & Fiscal</div>
                                            <h2 className="text-xl font-bold text-slate-800 mt-1">Informe de Auditoría</h2>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Ejecución programada cada 24 horas. Último reporte: <span className="font-semibold text-slate-700">{new Date(activeReport.timestamp).toLocaleString()}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${
                                                activeReport.status === 'SUCCESS' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                    : activeReport.status === 'WARNING'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {activeReport.status === 'SUCCESS' && '✓ SIN ERRORES'}
                                                {activeReport.status === 'WARNING' && '⚠ ADVERTENCIA'}
                                                {activeReport.status === 'ERROR' && '✗ ERRORES DETECTADOS'}
                                            </span>
                                            <button 
                                                onClick={runAuditAction}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95 animate-pulse"
                                            >
                                                Ejecutar Auditoría Ahora
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Report Results */}
                                    {activeReport.issues.length === 0 ? (
                                        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-4">
                                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                                            <h3 className="text-lg font-bold text-emerald-900 mb-1">¡Felicidades! Todo en Orden</h3>
                                            <p className="text-sm text-emerald-700">
                                                No se encontraron discrepancias en el cruce de datos contables, impuestos, SKUs o datos fiscales de terceros. Listo para SIIGO.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Detalle de Incidencias Halladas ({activeReport.issues.length})</div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {activeReport.issues.map((issue, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                                                            issue.severity === 'HIGH' 
                                                                ? 'bg-rose-50/40 border-rose-100' 
                                                                : 'bg-amber-50/30 border-amber-100'
                                                        }`}
                                                    >
                                                        <div className="mt-0.5">
                                                            <AlertTriangle className={`w-5 h-5 ${issue.severity === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-slate-800">{issue.description}</span>
                                                                <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded ${
                                                                    issue.severity === 'HIGH' 
                                                                        ? 'bg-rose-100 text-rose-700' 
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                    {issue.severity === 'HIGH' ? 'Crítico' : 'Medio'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                                                                    {issue.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{issue.details}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Historical Reports Log */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4">Historial de Corridas de Auditoría (Últimos 24H / Días Previos)</h3>
                                    <div className="overflow-hidden border border-slate-100 rounded-xl">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-3">ID Informe</th>
                                                    <th className="p-3">Fecha Corrida</th>
                                                    <th className="p-3">Hora de Ejecución</th>
                                                    <th className="p-3 text-center">Incidencias</th>
                                                    <th className="p-3">Resultado</th>
                                                    <th className="p-3 text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-600">
                                                {auditReports.map((report) => (
                                                    <tr 
                                                        key={report.id} 
                                                        className={`hover:bg-slate-50/50 transition-colors ${
                                                            activeReport.id === report.id ? 'bg-indigo-50/30' : ''
                                                        }`}
                                                    >
                                                        <td className="p-3 font-mono font-bold text-indigo-600">{report.id}</td>
                                                        <td className="p-3 font-semibold">{report.date}</td>
                                                        <td className="p-3 text-slate-500">{new Date(report.timestamp).toLocaleTimeString()}</td>
                                                        <td className="p-3 text-center font-bold text-slate-800">{report.issues.length}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                                report.status === 'SUCCESS' 
                                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                                    : report.status === 'WARNING'
                                                                        ? 'bg-amber-50 text-amber-700'
                                                                        : 'bg-rose-50 text-rose-700'
                                                            }`}>
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button 
                                                                onClick={() => setSelectedReportId(report.id)}
                                                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold text-xs"
                                                            >
                                                                {activeReport.id === report.id ? 'Viendo Reporte' : 'Ver Detalles'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* TAB 6: EXPORTACIÓN SIIGO */}
                        {activeTab === 'exportacion' && (
                            <div className="max-w-2xl mx-auto mt-8">
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 text-white text-center">
                                        <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-90" />
                                        <h2 className="text-2xl font-black mb-2">Generador SIIGO Nube</h2>
                                        <p className="text-indigo-100">Descarga las plantillas en Excel con los formatos oficiales de la DIAN listas para importar.</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Rango de Exportación</label>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <input type="date" className="bg-transparent font-bold text-slate-700 outline-none w-full" defaultValue="2026-06-01" />
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-300" />
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <input type="date" className="bg-transparent font-bold text-slate-700 outline-none w-full" defaultValue="2026-06-30" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-slate-100 flex gap-4">
                                            <button 
                                                onClick={handleExportSIIGO}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-5 h-5" />
                                                Generar Interfaces .XLSX
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 7: IMPORTACIONES EDI */}
                        {activeTab === 'importaciones' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full overflow-y-auto">
                                <ImportInvoicesPanel />
                            </div>
                        )}

                        {/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}
                        {activeTab === 'conciliacion_datafono' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col overflow-hidden relative">
                                {/* Format Selector Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 shrink-0">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                            <Landmark className="w-5 h-5 text-indigo-600" />
                                            Conciliación Bancaria Avanzada (Extractos & Tarjetas)
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">Cruza movimientos de extractos bancarios o abonos de pasarelas con las facturas y ventas del ERP.</p>
                                    </div>
                                    <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                                        <button
                                            onClick={() => {
                                                setReconciliationType('DATAFONO');
                                                setBankTransactions([]);
                                                setBankFileName('');
                                            }}
                                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${reconciliationType === 'DATAFONO' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Tarjetas / Datáfonos
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReconciliationType('DAVIVIENDA');
                                                setBankTransactions([]);
                                                setBankFileName('');
                                            }}
                                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${reconciliationType === 'DAVIVIENDA' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Extracto Davivienda
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReconciliationType('BBVA');
                                                setBankTransactions([]);
                                                setBankFileName('');
                                            }}
                                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${reconciliationType === 'BBVA' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Extracto BBVA
                                        </button>
                                    </div>
                                </div>

                                {/* Header / KPIs */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                                            {reconciliationType === 'DATAFONO' ? 'Pendiente Datáfono' : 'Ventas por Conciliar'}
                                        </span>
                                        <span className="text-2xl font-black text-indigo-900 mt-1">
                                            ${transactions
                                                .filter(t => t.type === 'VENTA' && (
                                                    reconciliationType === 'DATAFONO' 
                                                        ? t.paymentMethod.includes('Datáfonos') 
                                                        : (t.paymentMethod.includes('Transferencia') || t.paymentMethod.includes('PSE'))
                                                ) && t.validationStatus === 'PENDIENTE_VALIDACION')
                                                .filter(t => !reconciledList.some(r => r.sale.id === t.id))
                                                .reduce((sum, t) => sum + t.total, 0)
                                                .toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-xs text-indigo-600 mt-1 font-semibold">
                                            {transactions.filter(t => t.type === 'VENTA' && (
                                                reconciliationType === 'DATAFONO' 
                                                    ? t.paymentMethod.includes('Datáfonos') 
                                                    : (t.paymentMethod.includes('Transferencia') || t.paymentMethod.includes('PSE'))
                                            ) && t.validationStatus === 'PENDIENTE_VALIDACION').filter(t => !reconciledList.some(r => r.sale.id === t.id)).length} registros
                                        </span>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Movimientos Cargados</span>
                                        <span className="text-2xl font-black text-emerald-900 mt-1">
                                            ${bankTransactions
                                                .filter(b => !reconciledList.some(r => r.bank?.id === b.id))
                                                .reduce((sum, t) => sum + t.amount, 0)
                                                .toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-xs text-emerald-600 mt-1 font-semibold">
                                            {bankTransactions.filter(b => !reconciledList.some(r => r.bank?.id === b.id)).length} transacciones libres
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Neto en Banco</span>
                                        <span className="text-2xl font-black text-slate-900 mt-1">
                                            ${transactions
                                                .filter(t => t.validationStatus === 'VALIDADA' && t.bankAmount)
                                                .reduce((sum, t) => sum + (t.bankAmount || 0), 0)
                                                .toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-1 font-semibold font-mono">
                                            Cuenta 111005 (Bancos)
                                        </span>
                                    </div>
                                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Gastos & Retenciones</span>
                                        <span className="text-2xl font-black text-rose-900 mt-1">
                                            ${transactions
                                                .filter(t => t.validationStatus === 'VALIDADA')
                                                .reduce((sum, t) => sum + (t.bankFee || 0), 0)
                                                .toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-xs text-rose-600 mt-1 font-semibold font-mono">
                                            Comisiones (Gasto 5195)
                                        </span>
                                    </div>
                                </div>

                                {/* Banner superior para guardar lote */}
                                {reconciledList.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm shrink-0 animate-fade-in">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-amber-900 text-sm">Cruces listos para confirmación contable ({reconciledList.length})</h4>
                                                <p className="text-xs text-amber-700">Revisa el lote de conciliación antes de asentar los comprobantes en el libro mayor.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowReviewModal(true)}
                                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            Guardar Todo
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Main Split View */}
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                                    {/* Left Pane: Ventas ERP */}
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col min-h-0 bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-4 shrink-0">
                                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                                Ventas ERP Pendientes de Cruce
                                            </h3>
                                            <div className="relative w-48">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar venta..."
                                                    value={saleSearch}
                                                    onChange={e => setSaleSearch(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                            {transactions
                                                .filter(t => t.type === 'VENTA' && (
                                                    reconciliationType === 'DATAFONO' 
                                                        ? t.paymentMethod.includes('Datáfonos') 
                                                        : (t.paymentMethod.includes('Transferencia') || t.paymentMethod.includes('PSE'))
                                                ) && t.validationStatus === 'PENDIENTE_VALIDACION')
                                                .filter(t => !reconciledList.some(r => r.sale.id === t.id))
                                                .filter(t => !saleSearch || t.client.toLowerCase().includes(saleSearch.toLowerCase()) || t.id.toLowerCase().includes(saleSearch.toLowerCase()) || t.total.toString().includes(saleSearch))
                                                .map(t => {
                                                    const suggestion = suggestedMatches.get(t.id);
                                                    return (
                                                        <div
                                                            key={t.id}
                                                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col gap-3 shadow-sm"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="text-xs font-mono text-slate-400">{t.date}</div>
                                                                    <div className="font-black text-slate-800 mt-0.5">{t.id}</div>
                                                                    <div className="text-xs font-semibold text-slate-600 mt-1">{t.client}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-black text-slate-900">${t.total.toLocaleString('es-CO')}</div>
                                                                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                                                                        {t.paymentMethod}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {suggestion && (
                                                                <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                                                                    <span>Coincidencia sugerida: {suggestion.description} (${suggestion.amount.toLocaleString('es-CO')})</span>
                                                                    <span className="font-mono text-slate-400">Ref: {suggestion.ref}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex justify-end pt-2 border-t border-slate-100">
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveValidationSale(t);
                                                                        if (suggestion) {
                                                                            setBankAmountInput(suggestion.amount.toString());
                                                                            setBankFeeInput((t.total - suggestion.amount).toString());
                                                                        } else {
                                                                            setBankAmountInput(t.total.toString());
                                                                            setBankFeeInput('0');
                                                                        }
                                                                        setReteFuenteInput('0');
                                                                        setReteIvaInput('0');
                                                                        setReteIcaInput('0');
                                                                    }}
                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-1.5 px-3 rounded-lg shadow-sm active:scale-95 transition-all"
                                                                >
                                                                    Conciliar Fila
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {/* Right Pane: Bank Statement */}
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col min-h-0 bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-4 shrink-0">
                                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                <Landmark className="w-5 h-5 text-emerald-600" />
                                                Extracto Bancario
                                                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black font-mono">
                                                    {reconciliationType}
                                                </span>
                                            </h3>
                                            
                                            {bankTransactions.length > 0 ? (
                                                <button
                                                    onClick={() => {
                                                        setBankTransactions([]);
                                                        setBankFileName('');
                                                    }}
                                                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                                                >
                                                    Limpiar Extracto
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setBankFileName(`EXTRACTO_DEMO_${reconciliationType}_${new Date().toISOString().split('T')[0]}.xlsx`);
                                                        // Generate simulation data based on type
                                                        if (reconciliationType === 'DAVIVIENDA') {
                                                            setBankTransactions([
                                                                { id: 'bank-dv-1', date: new Date().toISOString().split('T')[0], description: 'TRF REC. CLIENTE MEGA S.A.', amount: 15000000, ref: 'DV-982103' },
                                                                { id: 'bank-dv-2', date: new Date().toISOString().split('T')[0], description: 'PSE PAGO PINTURAS NORTE', amount: 4950000, ref: 'PSE-348210' },
                                                                { id: 'bank-dv-3', date: new Date().toISOString().split('T')[0], description: 'ABONO CLIENTE TALLER S.', amount: 980000, ref: 'DV-120934' },
                                                                { id: 'bank-dv-4', date: new Date().toISOString().split('T')[0], description: 'COBRO CUOTA MANEJO PYME', amount: -65000, ref: 'DV-G1' }
                                                            ]);
                                                        } else if (reconciliationType === 'BBVA') {
                                                            setBankTransactions([
                                                                { id: 'bank-bb-1', date: new Date().toISOString().split('T')[0], description: 'ABONO TRANSF DISTRIBUIDORA G.', amount: 8500000, ref: 'BB-98210' },
                                                                { id: 'bank-bb-2', date: new Date().toISOString().split('T')[0], description: 'ABONO DIRECTO MEGA CONSTR', amount: 12000000, ref: 'BB-92348' },
                                                                { id: 'bank-bb-3', date: new Date().toISOString().split('T')[0], description: 'COMISION TRANSFERENCIA', amount: -4000, ref: 'BB-COM01' }
                                                            ]);
                                                        } else {
                                                            setBankTransactions([
                                                                { id: 'bank-dt-1', date: new Date().toISOString().split('T')[0], description: 'LIQ DIARIA DATAFONO REDEBAN', amount: 1450000, ref: 'RB-9021' },
                                                                { id: 'bank-dt-2', date: new Date().toISOString().split('T')[0], description: 'LIQ DIARIA CREDIBANCO VIS', amount: 2890000, ref: 'CB-4921' }
                                                            ]);
                                                        }
                                                    }}
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg"
                                                >
                                                    Cargar Extracto Demo (Muestra)
                                                </button>
                                            )}
                                        </div>

                                        {bankTransactions.length === 0 ? (
                                            <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 bg-white">
                                                <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                                                <p className="text-sm font-bold text-slate-700 mb-1">Cargar Extracto {reconciliationType}</p>
                                                <p className="text-xs text-slate-400 text-center mb-4 max-w-xs">
                                                    Sube el archivo Excel provisto por tu portal de {reconciliationType === 'DATAFONO' ? 'Datáfonos' : reconciliationType} para iniciar.
                                                </p>
                                                <input
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setBankFileName(file.name);
                                                            const reader = new FileReader();
                                                            reader.onload = (evt) => {
                                                                const bstr = evt.target?.result;
                                                                if (!bstr) return;
                                                                const wb = XLSX.read(bstr, { type: 'binary' });
                                                                const wsname = wb.SheetNames[0];
                                                                const ws = wb.Sheets[wsname];
                                                                const data = XLSX.utils.sheet_to_json(ws);
                                                                const parsed = data.map((row: any, idx) => {
                                                                    let date = '';
                                                                    let desc = '';
                                                                    let amount = 0;
                                                                    let ref = '';
                                                                    Object.keys(row).forEach(key => {
                                                                        const k = key.toLowerCase().trim();
                                                                        if (k.includes('fecha') || k.includes('date')) date = String(row[key]);
                                                                        if (k.includes('desc') || k.includes('concepto') || k.includes('detalle') || k.includes('info')) desc = String(row[key]);
                                                                        if (k.includes('monto') || k.includes('valor') || k.includes('deposito') || k.includes('crédito') || k.includes('abono') || k.includes('amount') || k.includes('ingreso') || k.includes('neto') || k.includes('importe')) {
                                                                            amount = Number(row[key]) || 0;
                                                                        }
                                                                        if (k.includes('ref') || k.includes('documento') || k.includes('nro') || k.includes('comprobante')) ref = String(row[key]);
                                                                    });
                                                                    return {
                                                                        id: `bank-${idx}`,
                                                                        date: date || new Date().toISOString().split('T')[0],
                                                                        description: desc || 'Transacción de Extracto',
                                                                        amount: Math.abs(amount),
                                                                        ref: ref || `REF-${Math.floor(100000 + Math.random() * 900000)}`
                                                                    };
                                                                });
                                                                setBankTransactions(parsed);
                                                            };
                                                            reader.readAsBinaryString(file);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id="bank-excel-file-extended"
                                                />
                                                <label
                                                    htmlFor="bank-excel-file-extended"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 px-4 rounded-xl cursor-pointer transition-all"
                                                >
                                                    Seleccionar Archivo Excel
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col min-h-0">
                                                <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded-lg font-medium mb-3 border border-emerald-100 flex items-center justify-between">
                                                    <span className="truncate">Archivo: <strong>{bankFileName}</strong></span>
                                                    <span className="shrink-0">{bankTransactions.filter(b => !reconciledList.some(r => r.bank?.id === b.id)).length} libres</span>
                                                </div>

                                                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                                    {bankTransactions
                                                        .filter(b => !reconciledList.some(r => r.bank?.id === b.id))
                                                        .map(b => {
                                                            const isLinked = Array.from(suggestedMatches.values()).some(m => m.id === b.id);
                                                            return (
                                                                <div
                                                                    key={b.id}
                                                                    className={`p-4 rounded-xl border transition-all ${
                                                                        isLinked 
                                                                            ? 'border-emerald-200 bg-emerald-50/20' 
                                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                                    }`}
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <div className="text-xs font-mono text-slate-400">{b.date}</div>
                                                                            <div className="font-black text-slate-800 mt-0.5">{b.description}</div>
                                                                            <div className="text-[10px] text-slate-500 font-mono mt-1">Ref: {b.ref}</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-black text-emerald-700">${b.amount.toLocaleString('es-CO')}</div>
                                                                            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                                isLinked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                                            } uppercase`}>
                                                                                {isLinked ? 'Sugerido' : 'Disponible'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Popup de Conciliación con Fórmulas de Retenciones */}
                                <AnimatePresence>
                                    {activeValidationSale && (() => {
                                        const suggestion = suggestedMatches.get(activeValidationSale.id);
                                        
                                        const valTotal = activeValidationSale.total;
                                        const totalNet = Number(bankAmountInput) || 0;
                                        const fee = Number(bankFeeInput) || 0;
                                        const rf = Number(reteFuenteInput) || 0;
                                        const ri = Number(reteIvaInput) || 0;
                                        const rc = Number(reteIcaInput) || 0;

                                        const sumDebits = totalNet + fee + rf + ri + rc;
                                        const difference = valTotal - sumDebits;

                                        return (
                                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                                                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200 max-h-[90vh]">
                                                    {/* Modal Header */}
                                                    <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
                                                        <h3 className="text-base font-black text-white flex items-center gap-2">
                                                            <Landmark className="w-5 h-5 text-indigo-400" />
                                                            Conciliar Factura vs. Banco
                                                        </h3>
                                                        <button onClick={() => setActiveValidationSale(null)} className="text-slate-400 hover:text-white transition-colors">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    {/* Modal Body */}
                                                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Factura ERP</span>
                                                                <div className="text-xs font-black text-slate-800 mt-0.5">{activeValidationSale.id}</div>
                                                                <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{activeValidationSale.client}</div>
                                                                <div className="text-sm font-black text-slate-950 mt-1">${valTotal.toLocaleString('es-CO')}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Movimiento Banco</span>
                                                                {suggestion ? (
                                                                    <>
                                                                        <div className="text-xs font-black text-emerald-800 mt-0.5 truncate">{suggestion.description}</div>
                                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {suggestion.ref}</div>
                                                                        <div className="text-sm font-black text-emerald-700 mt-1">${suggestion.amount.toLocaleString('es-CO')}</div>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-xs text-slate-400 italic mt-2">No se vinculó movimiento del extracto</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Monto Neto Acreditado ($)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={bankAmountInput}
                                                                        onChange={e => setBankAmountInput(e.target.value)}
                                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Costo / Comisión Banco ($)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={bankFeeInput}
                                                                        onChange={e => setBankFeeInput(e.target.value)}
                                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Colombian Withholdings Section */}
                                                            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-3">
                                                                <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">Impuestos & Deducciones (Retenciones)</span>
                                                                
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-slate-500 mb-1">ReteFuente ($)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={reteFuenteInput}
                                                                            onChange={e => setReteFuenteInput(e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono font-bold text-slate-700"
                                                                        />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => setReteFuenteInput(Math.round(valTotal * 0.015).toString())}
                                                                            className="text-[9px] text-indigo-600 font-bold mt-1 block hover:underline"
                                                                        >
                                                                            Calcular (1.5%)
                                                                        </button>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-slate-500 mb-1">ReteIVA ($)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={reteIvaInput}
                                                                            onChange={e => setReteIvaInput(e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono font-bold text-slate-700"
                                                                        />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => setReteIvaInput(Math.round((activeValidationSale.iva || (valTotal * 0.19 / 1.19)) * 0.15).toString())}
                                                                            className="text-[9px] text-indigo-600 font-bold mt-1 block hover:underline"
                                                                        >
                                                                            Calcular (15% IVA)
                                                                        </button>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-slate-500 mb-1">ReteICA ($)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={reteIcaInput}
                                                                            onChange={e => setReteIcaInput(e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono font-bold text-slate-700"
                                                                        />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => setReteIcaInput(Math.round(valTotal * 0.00966).toString())}
                                                                            className="text-[9px] text-indigo-600 font-bold mt-1 block hover:underline"
                                                                        >
                                                                            Calcular (9.66‰)
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Accounting Preview - Partida Doble */}
                                                            <div className="bg-slate-900 rounded-xl p-3 text-slate-300 font-mono text-[10px] space-y-1.5 border border-slate-950 shadow-inner">
                                                                <span className="text-slate-400 font-bold block border-b border-slate-800 pb-1 uppercase tracking-wide">
                                                                    Pre-visualización Contable (Partida Doble SIIGO)
                                                                </span>
                                                                <div className="flex justify-between">
                                                                    <span>111005 - Bancos (Débito)</span>
                                                                    <span className="text-emerald-400 font-bold">${totalNet.toLocaleString()}</span>
                                                                </div>
                                                                {fee > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span>519595 - Gasto Bancario / Comisión (Débito)</span>
                                                                        <span className="text-emerald-400 font-bold">${fee.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {rf > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span>135515 - ReteFuente (Débito)</span>
                                                                        <span className="text-emerald-400 font-bold">${rf.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {ri > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span>135517 - ReteIVA (Débito)</span>
                                                                        <span className="text-emerald-400 font-bold">${ri.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {rc > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span>135518 - ReteICA (Débito)</span>
                                                                        <span className="text-emerald-400 font-bold">${rc.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between border-t border-slate-800 pt-1">
                                                                    <span>130505 - Clientes Nacionales (Crédito)</span>
                                                                    <span className="text-rose-400 font-bold">${valTotal.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between border-t border-slate-700 pt-1 text-[9px]">
                                                                    <span className="text-slate-400">DESCUADRE CONTABLE:</span>
                                                                    <span className={`font-bold ${difference === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                        ${difference.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Modal Footer */}
                                                    <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center shrink-0">
                                                        <div>
                                                            {difference !== 0 && (
                                                                <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                    Diferencia pendiente: ${difference.toLocaleString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => setActiveValidationSale(null)}
                                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setReconciledList(prev => [
                                                                        ...prev,
                                                                        {
                                                                            sale: activeValidationSale,
                                                                            bankAmount: totalNet,
                                                                            bankFee: fee + rf + ri + rc, // Total financial deductions
                                                                            bank: suggestion
                                                                        }
                                                                    ]);
                                                                    setActiveValidationSale(null);
                                                                }}
                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-100 active:scale-95 transition-all"
                                                            >
                                                                Pre-validar Cruce
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </AnimatePresence>

                                {/* Batch validation review modal popup (overlay style) */}
                                {showReviewModal && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                                        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                                            {/* Modal Header */}
                                            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-indigo-400" />
                                                    Confirmar Lote de Conciliaciones
                                                </h3>
                                                <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            {/* Modal Body */}
                                            <div className="p-6 flex-1 overflow-y-auto">
                                                <p className="text-xs text-slate-500 mb-4">
                                                    Por favor revisa el listado de IDs de ventas pre-validadas antes de confirmar. Al guardar, las ventas pasarán a estado VALIDADA y se registrará el neto y la comisión en el banco.
                                                </p>
                                                
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-50 text-slate-500 font-bold">
                                                        <tr className="border-b border-slate-200">
                                                            <th className="py-2.5 px-3">Venta ID</th>
                                                            <th className="py-2.5 px-3">Cliente</th>
                                                            <th className="py-2.5 px-3 text-right">Monto ERP</th>
                                                            <th className="py-2.5 px-3 text-right">Neto Banco</th>
                                                            <th className="py-2.5 px-3 text-right">Deducción / Comis.</th>
                                                            <th className="py-2.5 px-3 text-center">Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {reconciledList.map((item, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                                <td className="py-3 px-3 font-mono font-bold text-slate-700">{item.sale.id}</td>
                                                                <td className="py-3 px-3 text-slate-600 font-medium">{item.sale.client}</td>
                                                                <td className="py-3 px-3 text-right font-bold text-slate-900">${item.sale.total.toLocaleString('es-CO')}</td>
                                                                <td className="py-3 px-3 text-right text-emerald-700 font-bold">${item.bankAmount.toLocaleString('es-CO')}</td>
                                                                <td className="py-3 px-3 text-right text-rose-600 font-bold">${item.bankFee.toLocaleString('es-CO')}</td>
                                                                <td className="py-3 px-3 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setReconciledList(prev => prev.filter((_, i) => i !== idx));
                                                                            if (reconciledList.length <= 1) setShowReviewModal(false);
                                                                        }}
                                                                        className="text-rose-600 hover:text-rose-700 hover:underline font-black text-xs"
                                                                    >
                                                                        Descartar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {/* Modal Footer */}
                                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between shrink-0">
                                                <div className="text-left">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resumen del Lote</div>
                                                    <div className="text-base font-black text-slate-800 mt-0.5">
                                                        Deducciones Totales: <span className="text-rose-600">${reconciledList.reduce((sum, item) => sum + item.bankFee, 0).toLocaleString('es-CO')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setShowReviewModal(false)}
                                                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            reconciledList.forEach(item => {
                                                                reconcileDatáfonoTransaction(item.sale.id, item.bankAmount, item.bankFee);
                                                            });
                                                            setReconciledList([]);
                                                            setShowReviewModal(false);
                                                        }}
                                                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95 transition-all"
                                                    >
                                                        Confirmar y Asentar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: FACTURAS POR CORREO */}
                        {activeTab === 'facturas_correo' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col overflow-hidden relative">
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                                    {/* Left pane: Mailbox list (Col span 5) */}
                                    <div className="lg:col-span-5 border border-slate-200 rounded-xl p-4 flex flex-col min-h-0 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2 shrink-0">
                                            <Mail className="w-5 h-5 text-indigo-600" />
                                            Inbox de Facturación Electrónica (Recepcionados)
                                        </h3>
                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                            {emails.map(email => (
                                                <div
                                                    key={email.id}
                                                    onClick={() => setSelectedEmail(email)}
                                                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                                        selectedEmail?.id === email.id
                                                            ? 'border-indigo-600 bg-indigo-50/30'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] text-slate-400 font-mono">{email.date}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                            email.status === 'PROCESADA'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {email.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-xs mt-1 truncate">{email.sender}</h4>
                                                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">{email.subject}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right pane: Email Detail (Col span 7) */}
                                    <div className="lg:col-span-7 border border-slate-200 rounded-xl p-6 bg-white flex flex-col min-h-0">
                                        {selectedEmail ? (
                                            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                                                {/* Header */}
                                                <div className="border-b border-slate-100 pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-sm">{selectedEmail.subject}</h3>
                                                            <p className="text-xs text-slate-500 mt-1">De: <strong className="text-slate-700">{selectedEmail.sender}</strong></p>
                                                        </div>
                                                        <span className="text-xs text-slate-400 font-mono">{selectedEmail.date}</span>
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="flex-1 overflow-y-auto text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    {selectedEmail.body}
                                                </div>

                                                {/* Attachments */}
                                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Documento Adjunto (XML / Factura Electrónica DIAN)</span>
                                                    <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs font-mono">XML</div>
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-800">{selectedEmail.attachment}</div>
                                                                <div className="text-[10px] text-slate-400 font-medium">{selectedEmail.attachmentSize}</div>
                                                            </div>
                                                        </div>
                                                        {selectedEmail.status === 'PENDIENTE' ? (
                                                            <button
                                                                onClick={() => {
                                                                    const p = selectedEmail.parsedData;
                                                                    setAiProvider(p.provider);
                                                                    setAiNit(p.nit);
                                                                    setAiInvoiceId(p.invoiceId);
                                                                    setAiDate(p.date);
                                                                    setAiSubtotal(p.subtotal.toString());
                                                                    setAiIva(p.iva.toString());
                                                                    setAiTotal(p.total.toString());
                                                                    setAiItems(p.items);
                                                                    setShowAiFormModal(true);
                                                                }}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                                                            >
                                                                <BrainCircuit className="w-4 h-4 animate-pulse" /> Procesar con IA
                                                            </button>
                                                        ) : (
                                                            <div className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                                                                ✓ Factura Contabilizada
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                                <Mail className="w-12 h-12 text-slate-300 mb-3 animate-bounce" />
                                                <p className="text-sm font-bold text-slate-600 mb-1">Visualizador de Facturas de Proveedores</p>
                                                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                                                    Selecciona un correo del listado de la izquierda para abrir el mensaje, descargar los soportes y contabilizar con la ayuda del Copiloto IA.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 10: CAJA MENOR */}
                        {activeTab === 'caja_menor' && (() => {
                            const FONDO_BASE = 2000000; // $2,000,000 COP
                            
                            // Egresos realizados
                            const egresos = transactions.filter(t => t.paymentMethod === 'Caja Menor' && t.type === 'COMPRA');
                            const totalEgresos = egresos.reduce((sum, e) => sum + e.total, 0);
                            
                            // Reposiciones / Reembolsos
                            const reposiciones = transactions.filter(t => t.paymentMethod === 'Caja Menor' && t.type === 'PAGO_RECIBIDO');
                            const totalReposiciones = reposiciones.reduce((sum, r) => sum + r.total, 0);
                            
                            const saldoDisponible = FONDO_BASE - totalEgresos + totalReposiciones;

                            const filteredCmHistory = [...egresos, ...reposiciones].filter(mov => {
                                if (cmHistoryDateFrom && mov.date < cmHistoryDateFrom) return false;
                                if (cmHistoryDateTo && mov.date > cmHistoryDateTo) return false;
                                if (cmHistorySku && (!mov.sku || !mov.sku.toLowerCase().includes(cmHistorySku.toLowerCase()))) return false;
                                if (cmHistoryMinPrice && mov.total < Number(cmHistoryMinPrice)) return false;
                                if (cmHistoryMaxPrice && mov.total > Number(cmHistoryMaxPrice)) return false;
                                return true;
                            }).sort((a, b) => b.date.localeCompare(a.date));

                            const handleRegistrarEgreso = (e: React.FormEvent) => {
                                e.preventDefault();
                                if (!egresoTercero || !egresoConcepto || !egresoValor || Number(egresoValor) <= 0) {
                                    alert('Por favor complete Tercero, Concepto y un Valor mayor a cero.');
                                    return;
                                }

                                if (egresoType === 'INVENTARIO') {
                                    if (!egresoSku) {
                                        alert('Por favor seleccione un SKU/Producto para el ingreso de inventario.');
                                        return;
                                    }
                                    if (!egresoCantidad || Number(egresoCantidad) <= 0) {
                                        alert('Por favor ingrese una cantidad válida mayor a cero.');
                                        return;
                                    }
                                }

                                const valor = Number(egresoValor);
                                if (valor > saldoDisponible) {
                                    alert('OPERACIÓN RECHAZADA: Saldo insuficiente en la Caja Menor para cubrir este egreso.');
                                    return;
                                }

                                const selectedProduct = inventory.find(p => p.sku === egresoSku);
                                
                                // Si es de tipo inventario, sumamos stock en Avalon
                                if (egresoType === 'INVENTARIO' && selectedProduct) {
                                    updateInventoryStock(selectedProduct.id, Number(egresoCantidad));
                                }

                                addTransaction({
                                    id: `CM-${Math.floor(Math.random() * 9000) + 1000}`,
                                    date: egresoFecha,
                                    type: 'COMPRA',
                                    client: egresoTercero,
                                    document: 'Caja Menor',
                                    productName: egresoType === 'INVENTARIO'
                                        ? `[Caja Menor] Compra Insumo: ${selectedProduct?.name || egresoSku} (${egresoConcepto})`
                                        : `[Caja Menor] Gasto: ${egresoConcepto}`,
                                    sku: egresoType === 'INVENTARIO' ? egresoSku : 'N/A',
                                    qty: egresoType === 'INVENTARIO' ? Number(egresoCantidad) : 1,
                                    total: valor,
                                    iva: 0,
                                    paymentMethod: 'Caja Menor',
                                    posLocation: pointsOfSale?.[0] || 'Bogotá'
                                });

                                // Limpiar formulario
                                setEgresoTercero('');
                                setEgresoConcepto('');
                                setEgresoValor('');
                                setEgresoSku('');
                                setEgresoCantidad('');
                                alert('Egreso registrado exitosamente en Caja Menor.');
                            };

                            const handleReembolsoCaja = () => {
                                const montoAReembolsar = FONDO_BASE - saldoDisponible;
                                if (montoAReembolsar <= 0) {
                                    alert('La Caja Menor ya se encuentra al 100% de su capacidad. No se requiere reembolso.');
                                    return;
                                }

                                if (confirm(`¿Confirma el reembolso de la Caja Menor por un valor de $${montoAReembolsar.toLocaleString('es-CO')} COP desde Bancos?`)) {
                                    addTransaction({
                                        id: `RC-${Math.floor(Math.random() * 9000) + 1000}`,
                                        date: new Date().toISOString().split('T')[0],
                                        type: 'PAGO_RECIBIDO',
                                        client: 'Reembolso Caja Menor',
                                        document: 'Reembolso Caja Menor',
                                        productName: 'Reposición / Reembolso de fondos de Caja Menor',
                                        sku: 'N/A',
                                        qty: 1,
                                        total: montoAReembolsar,
                                        iva: 0,
                                        paymentMethod: 'Caja Menor',
                                        posLocation: pointsOfSale?.[0] || 'Bogotá'
                                    });
                                    alert(`Caja Menor reembolsada. Saldo disponible restablecido a $${FONDO_BASE.toLocaleString('es-CO')} COP.`);
                                }
                            };

                            return (
                                <div className="space-y-6">
                                    {/* Caja Menor Metrics Card */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fondo Total Base</div>
                                                <div className="text-3xl font-black text-slate-900 mt-2">${FONDO_BASE.toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-400">COP</span></div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">Monto fijo autorizado de caja menor</div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gastos Acumulados</div>
                                                <div className="text-3xl font-black text-rose-600 mt-2">${(totalEgresos - totalReposiciones).toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-400">COP</span></div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-xs text-slate-500 font-medium">Pendientes por reembolso</span>
                                                <button
                                                    onClick={handleReembolsoCaja}
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                                                >
                                                    Reembolsar Caja
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo Disponible</div>
                                                <div className={`text-3xl font-black mt-2 ${saldoDisponible > 500000 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    ${saldoDisponible.toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-400">COP</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                                                Capacidad disponible: {((saldoDisponible / FONDO_BASE) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Register Expense and History layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        {/* Register Form */}
                                        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <Wallet className="w-5 h-5 text-indigo-500" />
                                                Registrar Egreso de Caja
                                            </h3>

                                            <form onSubmit={handleRegistrarEgreso} className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tipo de Movimiento</label>
                                                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEgresoType('GASTO')}
                                                            className={`py-2 text-xs font-bold rounded-lg transition-all ${egresoType === 'GASTO' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                                                        >
                                                            Gasto General
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEgresoType('INVENTARIO')}
                                                            className={`py-2 text-xs font-bold rounded-lg transition-all ${egresoType === 'INVENTARIO' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                                                        >
                                                            Compra Empaque/Stock
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fecha</label>
                                                    <input
                                                        type="date"
                                                        value={egresoFecha}
                                                        onChange={e => setEgresoFecha(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tercero / Proveedor</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej. Papelería La 15, Empaques S.A.S."
                                                        value={egresoTercero}
                                                        onChange={e => setEgresoTercero(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Descripción / Concepto</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej. Compra de marcadores, café, cajas de cartón"
                                                        value={egresoConcepto}
                                                        onChange={e => setEgresoConcepto(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                                                        required
                                                    />
                                                </div>

                                                {egresoType === 'INVENTARIO' && (
                                                    <div className="space-y-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-indigo-600 mb-1">Seleccionar Producto/Insumo</label>
                                                            <select
                                                                value={egresoSku}
                                                                onChange={e => setEgresoSku(e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                                                            >
                                                                <option value="">-- Seleccionar SKU --</option>
                                                                {inventory.map(p => (
                                                                    <option key={p.id} value={p.sku}>
                                                                        {p.sku} - {p.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-indigo-600 mb-1">Cantidad a ingresar</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                placeholder="Cantidad de unidades/litros"
                                                                value={egresoCantidad}
                                                                onChange={e => setEgresoCantidad(e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Monto / Valor ($)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Monto total del gasto"
                                                        value={egresoValor}
                                                        onChange={e => setEgresoValor(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800"
                                                        required
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="w-full py-3 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Registrar Movimiento
                                                </button>
                                            </form>
                                        </div>

                                        {/* History Table */}
                                        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[550px]">
                                            <h3 className="text-base font-bold text-slate-800 mb-2">Historial de Movimientos de Caja Menor</h3>
                                            
                                            {/* Filters Bar */}
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Fecha Desde</label>
                                                    <input 
                                                        type="date" 
                                                        value={cmHistoryDateFrom} 
                                                        onChange={e => setCmHistoryDateFrom(e.target.value)} 
                                                        className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Fecha Hasta</label>
                                                    <input 
                                                        type="date" 
                                                        value={cmHistoryDateTo} 
                                                        onChange={e => setCmHistoryDateTo(e.target.value)} 
                                                        className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Buscar por SKU</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej: 202401" 
                                                        value={cmHistorySku} 
                                                        onChange={e => setCmHistorySku(e.target.value)} 
                                                        className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Monto (Mín - Máx)</label>
                                                    <div className="flex gap-1">
                                                        <input 
                                                            type="number" 
                                                            placeholder="Mín" 
                                                            value={cmHistoryMinPrice} 
                                                            onChange={e => setCmHistoryMinPrice(e.target.value)} 
                                                            className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white"
                                                        />
                                                        <input 
                                                            type="number" 
                                                            placeholder="Máx" 
                                                            value={cmHistoryMaxPrice} 
                                                            onChange={e => setCmHistoryMaxPrice(e.target.value)} 
                                                            className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                                                        <tr className="border-b border-slate-200">
                                                            <th className="py-3 px-4">Fecha</th>
                                                            <th className="py-3 px-4">Comprobante ID</th>
                                                            <th className="py-3 px-4">Tercero</th>
                                                            <th className="py-3 px-4">Concepto</th>
                                                            <th className="py-3 px-4">SKU</th>
                                                            <th className="py-3 px-4 text-center">Cant</th>
                                                            <th className="py-3 px-4 text-right">Valor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {filteredCmHistory.map((mov, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                                <td className="py-3.5 px-4 text-slate-500 font-medium">{mov.date}</td>
                                                                <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{mov.id}</td>
                                                                <td className="py-3.5 px-4 text-slate-700 font-bold">{mov.client}</td>
                                                                <td className="py-3.5 px-4 text-slate-600 font-medium truncate max-w-[200px]" title={mov.productName}>
                                                                    {mov.productName}
                                                                </td>
                                                                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{mov.sku || 'N/A'}</td>
                                                                <td className="py-3.5 px-4 text-center font-bold text-slate-700">{mov.qty}</td>
                                                                <td className={`py-3.5 px-4 text-right font-black ${mov.type === 'PAGO_RECIBIDO' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                                    {mov.type === 'PAGO_RECIBIDO' ? '+' : '-'}${mov.total.toLocaleString('es-CO')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {filteredCmHistory.length === 0 && (
                                                            <tr>
                                                                <td colSpan={7} className="text-center py-20 text-slate-400 font-medium">
                                                                    No se encontraron movimientos con los filtros aplicados.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

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
