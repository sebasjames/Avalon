import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { usePosShortcuts } from '../hooks/usePosShortcuts';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Search, ShoppingCart, Users, Tag, AlertTriangle, ShieldCheck, 
    Calculator, Trash2, Plus, Minus, Check, CreditCard, Receipt, HandCoins, Box, ArrowRight, X, MapPin, ChevronDown, Wallet, UploadCloud, Info
} from 'lucide-react';
import { formatCOP } from '../utils/format';
import { Product, CrmContact, CustomerTier } from '../types';
import { RETEFUENTE_RATE, RETEICA_BOGOTA, RETEICA_BARRANQUILLA } from '../constants';

export const SmartPosPanel: React.FC = () => {
    const { 
        inventory, updateInventoryStock, updateInventoryProduct, 
        addEvent, deals, receipts, crmUsers, 
        recipes, addRecipe, deleteRecipe,
        paymentMethods, pointsOfSale,
        taxRules, pricingRules, paymentRules, rawMaterialCategories,
        contacts, tintometricRules, reverseDisplayRules, litersToCunetesRules, fractionalRules, addTransaction,
        taxRates, updateContact
    } = useEnterprise();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const isReversedDisplay = (product: Product) => {
        const s = (product.sku || '').toUpperCase();
        const n = (product.name || '').toUpperCase();
        const b = (product.brand || '').toUpperCase();
        const f = (product.family || '').toUpperCase();
        return reverseDisplayRules.some(trigger => s.includes(trigger) || n.includes(trigger) || b.includes(trigger) || f.includes(trigger));
    };

    const isTintometric = (product: Product) => {
        const s = (product.sku || '').toUpperCase();
        const n = (product.name || '').toUpperCase();
        return tintometricRules.some(trigger => s.includes(trigger) || n.includes(trigger));
    };

    const isCuneteEligible = (product: Product) => {
        const s = (product.sku || '').toUpperCase();
        const n = (product.name || '').toUpperCase();
        const b = (product.brand || '').toUpperCase();
        const f = (product.family || '').toUpperCase();
        return litersToCunetesRules.some(trigger => s.includes(trigger) || n.includes(trigger) || b.includes(trigger) || f.includes(trigger));
    };

    const isFractionalEligible = (product: Product) => {
        const s = (product.sku || '').toUpperCase();
        const n = (product.name || '').toUpperCase();
        const b = (product.brand || '').toUpperCase();
        const f = (product.family || '').toUpperCase();
        return fractionalRules.some(trigger => s.includes(trigger) || n.includes(trigger) || b.includes(trigger) || f.includes(trigger));
    };

    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<{ id: string; product: Product; qty: number; colorNote?: string; isCunete?: boolean }[]>([]);
    const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    
    const filteredContacts = useMemo(() => {
        if (!customerSearch) return contacts;
        const term = customerSearch.toLowerCase();
        return contacts.filter(c => 
            c.name.toLowerCase().includes(term) || 
            c.company.toLowerCase().includes(term) || 
            (c.documentNumber && c.documentNumber.includes(term))
        );
    }, [contacts, customerSearch]);
    
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(() => {
        const card = paymentMethods?.find(p => p.toLowerCase().includes('tarjeta'));
        return card || (paymentMethods?.length > 0 ? paymentMethods[0] : 'Tarjeta');
    });
    
    const [selectedPointOfSale, setSelectedPointOfSale] = useState<string>(() => {
        return pointsOfSale?.length > 0 ? pointsOfSale[0] : '';
    });

    const [isMarginMode, setIsMarginMode] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('avalon_recent_colors');
            return saved ? JSON.parse(saved) : ['RAL 9010', 'RAL 9005', 'BLANCO NIEVE'];
        } catch(e) { return []; }
    });

    // --- NUEVO: ESTADO REGISTRO DE GASTOS POS (CAJA MENOR EN TIEMPO REAL) ---
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseConcept, setExpenseConcept] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseProvider, setExpenseProvider] = useState('');
    const [expenseFile, setExpenseFile] = useState<string | null>(null);

    const [showShortcutsModal, setShowShortcutsModal] = useState(false);

    useEffect(() => {
        const handleOpen = () => setShowShortcutsModal(true);
        window.addEventListener('open-pos-shortcuts', handleOpen);
        return () => window.removeEventListener('open-pos-shortcuts', handleOpen);
    }, []);

    const activeCustomer = useMemo(() => {
        return contacts.find(c => c.id === selectedCustomerId) || null;
    }, [selectedCustomerId, contacts]);

    const discountPercent = useMemo(() => {
        if (selectedPaymentMethod === 'Muestra') return 100;
        if (!activeCustomer) return 0;
        
        if (activeCustomer.pricingRuleId) {
            const rule = pricingRules.find(r => r.id === activeCustomer.pricingRuleId);
            if (rule) return rule.discountPercentage;
        }

        if (activeCustomer.tier === CustomerTier.STRATEGIC) return 15;
        if (activeCustomer.tier === CustomerTier.REGULAR) return 5;
        return 0;
    }, [activeCustomer, pricingRules, selectedPaymentMethod]);

    const customerSearchInputRef = useRef<HTMLInputElement>(null);
    const mainSearchInputRef = useRef<HTMLInputElement>(null);

    const filteredCatalog = useMemo(() => {
        if (!search) return inventory;
        const s = search.toLowerCase();
        
        return inventory.filter(item => {
            if ((s === 'albaran' || s === 'albarran') && (item.sku || '').startsWith('ALB-')) return true;
            return (item.name || '').toLowerCase().includes(s) || 
                   (item.sku || '').toLowerCase().includes(s) || 
                   (item.originalSku && item.originalSku.toLowerCase().includes(s)) ||
                   (item.barcode && item.barcode.toLowerCase().includes(s));
        });
    }, [inventory, search]);

    // Smart Cross-Selling Alerts
    const smartAlerts = useMemo(() => {
        const alerts: string[] = [];
        
        const hasVetroPrem = cart.some(c => c.product.sku.includes('VETRO-PREM'));
        const hasCat7074 = cart.some(c => c.product.sku.includes('CAT7074'));
        const hasIgh880 = cart.some(c => c.product.sku.includes('IGH880'));
        const hasMultiadherencia = cart.some(c => c.product.sku.includes('VETRO-IPT1090'));

        if (hasVetroPrem && !hasCat7074) {
            alerts.push("¡Falta el Catalizador! La gama Vetro Premium requiere CAT 7074. ¿Lo agregamos?");
        }
        if (hasMultiadherencia && !hasIgh880) {
            alerts.push("Vetro Multiadherencia requiere el catalizador IGH880. No olvides ofrecerlo.");
        }
        
        return alerts;
    }, [cart]);

    const addToCart = (product: Product) => {
        const isBase = isTintometric(product);
        setCart(prev => {
            if (isBase) {
                const newItem = { id: Math.random().toString(36).substring(7), product, qty: 1, colorNote: '', isCunete: false };
                setSelectedCartItemId(newItem.id);
                return [...prev, newItem];
            }
            const existing = prev.find(item => item.product.id === product.id && !item.colorNote && !item.isCunete);
            if (existing) {
                setSelectedCartItemId(existing.id);
                return prev.map(item => item.id === existing.id ? { ...item, qty: item.qty + 1 } : item);
            }
            const newItem = { id: Math.random().toString(36).substring(7), product, qty: 1, isCunete: false };
            setSelectedCartItemId(newItem.id);
            return [...prev, newItem];
        });
        setSearch(''); // Auto clear search for fast scanning
    };

    // --- GLOBAL BARCODE SCANNER LISTENER ---
    const addToCartRef = useRef(addToCart);
    useEffect(() => {
        addToCartRef.current = addToCart;
    }, [addToCart]);

    useEffect(() => {
        let barcodeBuffer = '';
        let lastKeyTime = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user is typing manually into a specific input (like discount, notes)
            // We allow the 'search' input to receive the events because 'addToCart' clears it automatically.
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                if (e.target.type !== 'text') return; 
            }

            const now = Date.now();
            
            // Scanners type very fast. If > 60ms delay between keys, reset buffer.
            if (now - lastKeyTime > 60) {
                barcodeBuffer = '';
            }
            
            // Scanners usually append 'Enter' at the end of the barcode sequence
            if (e.key === 'Enter' && barcodeBuffer.length > 5) {
                const product = inventory.find(p => p.barcode === barcodeBuffer);
                if (product) {
                    addToCartRef.current(product);
                    e.preventDefault();
                }
                barcodeBuffer = '';
            } else if (e.key.length === 1) { // Accumulate printable characters
                barcodeBuffer += e.key;
            }
            
            lastKeyTime = now;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inventory]);

    const updateQty = (cartId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === cartId) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const setExactQty = (cartId: string, qty: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === cartId) {
                return { ...item, qty: Math.max(0, qty) };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const updateColor = (cartId: string, color: string) => {
        setCart(prev => prev.map(item => item.id === cartId ? { ...item, colorNote: color } : item));
    };

    const toggleCunete = (cartId: string) => {
        setCart(prev => prev.map(item => item.id === cartId ? { ...item, isCunete: !item.isCunete } : item));
    };

    // Financials
    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => {
            const price = rawMaterialCategories.includes(item.product.category) ? item.product.unitCost * 1.3 : item.product.price;
            const multiplier = item.isCunete ? 20 : 1;
            return acc + (price * item.qty * multiplier);
        }, 0);
    }, [cart]);

    const discountAmount = subtotal * (discountPercent / 100);
    
    // Taxes Breakdown
    const taxesBreakdown = useMemo(() => {
        const breakdown: Record<number, number> = {};
        
        // Find default rate if product doesn't have one
        const defaultTax = taxRates?.find(t => t.isDefault) || { percentage: 19 };

        // Check if customer has a tax rule override
        let overrideRate: number | null = null;
        if (activeCustomer && activeCustomer.taxRuleId) {
            const rule = taxRules.find(r => r.id === activeCustomer.taxRuleId);
            if (rule) overrideRate = rule.taxRateOverride;
        }

        cart.forEach(item => {
            const price = rawMaterialCategories.includes(item.product.category) ? item.product.unitCost * 1.3 : item.product.price;
            const multiplier = item.isCunete ? 20 : 1;
            const lineTotal = price * item.qty * multiplier;
            const discountRatio = discountPercent > 0 ? (1 - discountPercent / 100) : 1;
            const finalLineTotal = lineTotal * discountRatio;
            
            // Apply customer tax rule override, product rate, or default rate
            const rate = overrideRate !== null ? overrideRate : (item.product.taxRate ?? defaultTax.percentage);
            
            if (!breakdown[rate]) breakdown[rate] = 0;
            breakdown[rate] += finalLineTotal * (rate / 100);
        });
        
        return breakdown;
    }, [cart, discountPercent, taxRates, activeCustomer, taxRules]);

    const taxes = Object.values(taxesBreakdown).reduce((acc, val) => acc + val, 0);

    const retenciones = useMemo(() => {
        let reteFuente = 0;
        let reteIca = 0;
        
        const subtotalNeto = subtotal - discountAmount;
        
        if (activeCustomer) {
            if (activeCustomer.fiscalClassification === 'PERSONA_JURIDICA' || activeCustomer.fiscalClassification === 'GRAN_CONTRIBUYENTE') {
                reteFuente = subtotalNeto * (RETEFUENTE_RATE / 100); 
            }
            if (activeCustomer.cityCode === 'BOGOTA') {
                reteIca = subtotalNeto * (RETEICA_BOGOTA / 100); 
            } else if (activeCustomer.cityCode === 'BARRANQUILLA') {
                reteIca = subtotalNeto * (RETEICA_BARRANQUILLA / 100); 
            }
        }
        
        return { reteFuente, reteIca };
    }, [activeCustomer, subtotal, discountAmount]);

    const total = (subtotal - discountAmount) + taxes - retenciones.reteFuente - retenciones.reteIca;

    const totalCost = useMemo(() => {
        return cart.reduce((acc, item) => {
            const multiplier = item.isCunete ? 20 : 1;
            return acc + (item.product.unitCost * item.qty * multiplier);
        }, 0);
    }, [cart]);

    const grossMargin = (subtotal - discountAmount) - totalCost;
    const marginPercent = subtotal > 0 ? (grossMargin / (subtotal - discountAmount)) * 100 : 0;

    const handleCheckout = () => {
        if (cart.length === 0) return;
        
        // Guardar historial de colores usados
        const newColors = [...recentColors];
        let hasNew = false;
        cart.forEach(item => {
            if (item.colorNote && item.colorNote.trim() !== '') {
                const c = item.colorNote.trim().toUpperCase();
                if (!newColors.includes(c)) {
                    newColors.push(c);
                    hasNew = true;
                }
            }
        });
        if (hasNew) {
            setRecentColors(newColors);
            localStorage.setItem('avalon_recent_colors', JSON.stringify(newColors));
        }

        if (selectedPaymentMethod === 'Saldo a Favor') {
            if (!activeCustomer) {
                alert('Debe seleccionar un cliente para pagar con Saldo a Favor.');
                return;
            }
            if ((activeCustomer.accountBalance || 0) < total) {
                alert(`El cliente no tiene suficiente Saldo a Favor. Saldo actual: ${formatCOP(activeCustomer.accountBalance || 0)}`);
                return;
            }
        }

        const isCreditSale = selectedPaymentMethod.toLowerCase().includes('crédito') || selectedPaymentMethod.toLowerCase().includes('credito');
        if (isCreditSale) {
            if (!activeCustomer) {
                alert('Las ventas a crédito requieren seleccionar un cliente del CRM.');
                return;
            }
            if (activeCustomer.hasOverdueBills) {
                alert('OPERACIÓN DENEGADA: El cliente tiene facturas en mora / saldos vencidos en cartera. Despacho no autorizado.');
                return;
            }
            const remainingLimit = (activeCustomer.creditLimit || 0) - (activeCustomer.creditLimitUsed || 0);
            if (total > remainingLimit) {
                alert(`OPERACIÓN DENEGADA: La venta supera el cupo de crédito disponible del cliente.\n\nCupo Total: ${formatCOP(activeCustomer.creditLimit || 0)}\nUtilizado: ${formatCOP(activeCustomer.creditLimitUsed || 0)}\nDisponible: ${formatCOP(remainingLimit)}\nRequerido para esta venta: ${formatCOP(total)}`);
                return;
            }
        }

        // --- VALIDAR INVENTARIO ESTRICTAMENTE ---
        const requiredStock = new Map<string, number>();
        for (const item of cart) {
            if (item.product.category !== 'Servicio') {
                const recipe = recipes.find(r => r.finalProductId === item.product.id);
                const multiplier = item.isCunete ? 20 : 1;
                
                if (recipe) {
                    recipe.ingredients.forEach(ing => {
                        const current = requiredStock.get(ing.productId) || 0;
                        requiredStock.set(ing.productId, current + (ing.quantity * item.qty * multiplier));
                    });
                } else {
                    const current = requiredStock.get(item.product.id) || 0;
                    requiredStock.set(item.product.id, current + (item.qty * multiplier));
                }
            }
        }

        for (const [productId, qtyNeeded] of requiredStock.entries()) {
            const product = inventory.find(p => p.id === productId);
            if (product && product.category !== 'Servicio') {
                if (product.totalStock < qtyNeeded) {
                    alert(`Operación denegada: Stock insuficiente para "${product.name}". Requerido: ${qtyNeeded.toFixed(2)}, Disponible: ${product.totalStock.toFixed(2)}`);
                    return; // Bloquear el checkout
                }
            }
        }

        // --- CONECTAR CON INVENTARIO Y CONTABILIDAD ---
        const invoiceId = `FV-${Math.floor(Math.random() * 9000) + 1000}`;
        const dateStr = new Date().toISOString().split('T')[0];
        
        cart.forEach(item => {
            const recipe = recipes.find(r => r.finalProductId === item.product.id);
            const multiplier = item.isCunete ? 20 : 1;

            // Descontar inventario real (solo si no es un servicio)
            if (item.product.category !== 'Servicio') {
                if (recipe) {
                    recipe.ingredients.forEach(ing => {
                        const ingProduct = inventory.find(p => p.id === ing.productId);
                        if (ingProduct && ingProduct.category !== 'Servicio') {
                            updateInventoryStock(ing.productId, -(ing.quantity * item.qty * multiplier));
                        }
                    });
                } else {
                    updateInventoryStock(item.product.id, -(item.qty * multiplier));
                }
            }

            // Calcular valores
            const price = isMarginMode ? (item.product.unitCost * 1.3) : (item.product.price || item.product.unitCost * 1.3);
            const appliedPrice = activeCustomer ? price * (1 - discountPercent / 100) : price;
            const subtotalLine = appliedPrice * item.qty * multiplier;
            
            const defaultTax = taxRates?.find(t => t.isDefault) || { percentage: 19 };
            const rate = item.product.taxRate ?? defaultTax.percentage;
            const iva = subtotalLine * (rate / 100);

            // Registrar transacción en Sábana General
            let prodName = item.product.name + (item.colorNote ? ` [${item.colorNote}]` : '');
            if (item.isCunete) prodName += ' (Facturado en Cuñetes 20L)';

            addTransaction({
                id: invoiceId,
                date: dateStr,
                type: 'VENTA',
                client: activeCustomer ? activeCustomer.name : 'Consumidor Final',
                document: activeCustomer ? `${activeCustomer.documentType || 'NIT'} ${activeCustomer.documentNumber}` : '222222222',
                productName: prodName,
                sku: item.product.sku,
                qty: item.qty * multiplier,
                total: subtotalLine,
                iva: iva,
                paymentMethod: selectedPaymentMethod,
                posLocation: selectedPointOfSale,
                dueDate: isCreditSale ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
                paymentStatus: isCreditSale ? 'PENDIENTE' : 'PAGADA',
                balance: isCreditSale ? subtotalLine : 0
            });
        });

        if (isCreditSale && activeCustomer) {
            updateContact(activeCustomer.id, {
                creditLimitUsed: (activeCustomer.creditLimitUsed || 0) + total
            });
        }

        if (selectedPaymentMethod === 'Saldo a Favor' && activeCustomer) {
            updateContact(activeCustomer.id, { accountBalance: (activeCustomer.accountBalance || 0) - total });
        }

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setCart([]);
            setSelectedCustomerId('');
        }, 3000);
    };

    const handleCheckoutRef = useRef(handleCheckout);
    useEffect(() => {
        handleCheckoutRef.current = handleCheckout;
    }, [handleCheckout]);

    usePosShortcuts({
        onSearchClient: () => {
            setIsCustomerDropdownOpen(true);
            setTimeout(() => {
                customerSearchInputRef.current?.focus();
            }, 100);
        },
        onFocusSearch: () => {
            mainSearchInputRef.current?.focus();
        },
        onCheckout: () => {
            if (cart.length > 0) {
                if (!isMarginMode) {
                    setIsMarginMode(true);
                } else {
                    handleCheckoutRef.current();
                    setIsMarginMode(false);
                }
            }
        },
        onCancel: () => {
            if (isCustomerDropdownOpen) {
                setIsCustomerDropdownOpen(false);
            } else if (cart.length > 0) {
                if (window.confirm('¿Desea vaciar el carrito?')) {
                    setCart([]);
                    setSelectedCartItemId(null);
                }
            } else {
                setSearch('');
            }
        },
        onDeleteLine: () => {
            if (selectedCartItemId) {
                setCart(prev => prev.filter(item => item.id !== selectedCartItemId));
                setSelectedCartItemId(null);
            }
        },
        onIncreaseQty: () => {
            if (selectedCartItemId) {
                updateQty(selectedCartItemId, 1);
            }
        },
        onDecreaseQty: () => {
            if (selectedCartItemId) {
                updateQty(selectedCartItemId, -1);
            }
        },
        onNavigateUp: () => {
            if (cart.length === 0) return;
            const currentIndex = cart.findIndex(c => c.id === selectedCartItemId);
            if (currentIndex > 0) {
                setSelectedCartItemId(cart[currentIndex - 1].id);
            } else if (currentIndex === -1) {
                setSelectedCartItemId(cart[cart.length - 1].id);
            }
        },
        onNavigateDown: () => {
            if (cart.length === 0) return;
            const currentIndex = cart.findIndex(c => c.id === selectedCartItemId);
            if (currentIndex < cart.length - 1 && currentIndex !== -1) {
                setSelectedCartItemId(cart[currentIndex + 1].id);
            } else if (currentIndex === -1) {
                setSelectedCartItemId(cart[0].id);
            }
        }
    });

    return (
        <div className="absolute inset-0 bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans z-10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none z-0"></div>

            {/* Left Panel: Catalog */}
            <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden z-10 relative">
                
                {/* Top Bar: Search & Actions */}
                <div className="flex gap-4 mb-6">
                    {/* Search Bar - Scanner Ready */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex items-center relative overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
                        <div className="pl-4 pr-2 text-indigo-500">
                            <Search className="w-6 h-6" />
                        </div>
                        <input 
                            ref={mainSearchInputRef}
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Escanear código de barras o buscar producto (F7)..." 
                            className="w-full bg-transparent py-4 outline-none text-lg font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                            autoFocus
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="p-4 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setExpenseConcept('');
                            setExpenseAmount('');
                            setExpenseProvider('');
                            setExpenseFile(null);
                            setShowExpenseModal(true);
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-6 py-2 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0 whitespace-nowrap h-full"
                    >
                        <Wallet className="w-4 h-4" /> Registrar Gasto de Caja
                    </button>
                </div>

                {/* Catalog Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredCatalog.map((product) => {
                                const price = rawMaterialCategories.includes(product.category) ? product.unitCost * 1.3 : product.price;
                                const atp = product.totalStock - product.reservedStock;
                                const reversed = isReversedDisplay(product);
                                
                                return (
                                    <motion.button 
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => addToCart(product)}
                                        className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col h-40 group relative overflow-hidden"
                                    >
                                        {/* Status Line */}
                                        <div className={`absolute top-0 left-0 w-full h-1 ${atp > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>

                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider line-clamp-1 ${reversed ? 'bg-indigo-100 text-indigo-700 max-w-[70%]' : 'bg-slate-100 text-slate-600'}`} title={reversed ? product.name : (product.sku || '').split('-')[0]}>
                                                {reversed ? product.name : (product.sku || '').split('-')[0]}
                                            </div>
                                            <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors shrink-0">
                                                {formatCOP(price, false)}
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm text-slate-800 leading-tight mb-auto line-clamp-2" title={reversed ? product.sku : product.name}>
                                            {reversed ? product.sku : product.name}
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-xs text-slate-400 font-mono">{product.originalSku}</div>
                                            <div className={`text-xs font-bold ${atp > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {atp > 0 ? `${atp} disp` : 'Agotado'}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                        {filteredCatalog.length === 0 && (
                            <div className="col-span-full py-20 text-center text-slate-400 font-medium flex flex-col items-center">
                                <Box className="w-12 h-12 mb-4 opacity-50" />
                                No se encontraron productos. Verifica el escáner.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Cart & Checkout */}
            <div className="w-full md:w-[400px] lg:w-[480px] bg-white border-l border-slate-200 flex flex-col shadow-2xl z-20">
                
                {/* Header: Customer Selection */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 relative">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Cliente (CRM)</label>
                    <div className="relative">
                        <div 
                            onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold py-3 px-4 rounded-xl shadow-sm cursor-pointer flex justify-between items-center hover:border-indigo-300 transition-colors"
                        >
                            <span className="truncate">
                                {selectedCustomerId === '' 
                                    ? 'Consumidor Final (Mostrador)' 
                                    : (() => {
                                        const c = contacts.find(c => c.id === selectedCustomerId);
                                        return c ? `${c.name} - ${c.company}` : 'Cliente Desconocido';
                                    })()}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        <AnimatePresence>
                            {isCustomerDropdownOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="p-2 border-b border-slate-100">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" 
                                                ref={customerSearchInputRef}
                                                placeholder="Buscar por nombre, empresa, o NIT..."
                                                value={customerSearch}
                                                onChange={e => setCustomerSearch(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-lg py-2 pl-9 pr-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        <div 
                                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 transition-colors"
                                            onClick={() => { setSelectedCustomerId(''); setIsCustomerDropdownOpen(false); }}
                                        >
                                            <div className="text-sm font-bold text-slate-800">Consumidor Final (Mostrador)</div>
                                            <div className="text-xs text-slate-500">Sin registro en CRM</div>
                                        </div>
                                        {filteredContacts.map(c => (
                                            <div 
                                                key={c.id} 
                                                onClick={() => { setSelectedCustomerId(c.id); setIsCustomerDropdownOpen(false); }}
                                                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 transition-colors"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="text-sm font-bold text-slate-800 truncate pr-2">{c.name}</div>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                                                        c.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-700' :
                                                        c.tier === 'GOLD' ? 'bg-amber-100 text-amber-700' :
                                                        c.tier === 'SILVER' ? 'bg-slate-200 text-slate-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {c.tier}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-medium text-slate-500 mt-0.5 flex gap-2">
                                                    <span>{c.company}</span>
                                                    {c.documentNumber && <span className="text-slate-400">| NIT: {c.documentNumber}</span>}
                                                </div>
                                            </div>
                                        ))}
                                        {filteredContacts.length === 0 && (
                                            <div className="px-4 py-6 text-center text-sm text-slate-400">
                                                No se encontraron clientes
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    <AnimatePresence>
                        {cart.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                                <p className="font-medium text-sm">El recibo está vacío</p>
                                <p className="text-xs mt-1">Escanea productos para comenzar</p>
                            </motion.div>
                        ) : (
                            cart.map((item) => {
                                const price = rawMaterialCategories.includes(item.product.category) ? item.product.unitCost * 1.3 : item.product.price;
                                const multiplier = item.isCunete ? 20 : 1;
                                const totalItem = price * item.qty * multiplier;
                                const recipe = recipes.find(r => r.finalProductId === item.product.id);
                                const isExpanded = expandedItems.includes(item.id);
                                const isService = item.product.sku.toUpperCase().includes('SERV-');

                                const toggleExpand = () => {
                                    if (isExpanded) setExpandedItems(expandedItems.filter(id => id !== item.id));
                                    else setExpandedItems([...expandedItems, item.id]);
                                };

                                return (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                        onClick={() => setSelectedCartItemId(item.id)}
                                        className={`${isService ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-slate-100'} border rounded-2xl p-3 shadow-sm flex items-start gap-3 relative overflow-hidden group transition-all cursor-pointer ${selectedCartItemId === item.id ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:border-slate-300'}`}
                                    >
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-slate-400 font-mono mb-0.5">{item.product.sku}</div>
                                            <div className="text-sm font-bold text-slate-800 leading-tight mb-2 pr-6">{item.product.name}</div>
                                            
                                            {isTintometric(item.product) && (
                                                <div className="mb-3">
                                                    <label className="text-[10px] uppercase font-bold text-indigo-500 mb-1 flex items-center gap-1">
                                                        <Box className="w-3 h-3" /> Fórmula / Color
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        list="recent-colors"
                                                        placeholder="Ej: RAL 9010, NCS S 1080-Y..."
                                                        value={item.colorNote || ''}
                                                        onChange={(e) => updateColor(item.id, e.target.value)}
                                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 font-bold placeholder:font-normal"
                                                    />
                                                </div>
                                            )}

                                            {isCuneteEligible(item.product) && (
                                                <div className="mb-3">
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <div className="relative">
                                                            <input type="checkbox" className="sr-only" checked={item.isCunete} onChange={() => toggleCunete(item.id)} />
                                                            <div className={`block w-10 h-6 rounded-full transition-colors ${item.isCunete ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${item.isCunete ? 'transform translate-x-4' : ''}`}></div>
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-600 select-none group-hover:text-indigo-600 transition-colors">
                                                            Facturar en Cuñetes (20L)
                                                        </div>
                                                    </label>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 mt-1">
                                                {/* Qty Controls */}
                                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 focus-within:ring-2 focus-within:border-indigo-500 focus-within:ring-indigo-200">
                                                    <button onClick={() => updateQty(item.id, -1)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"><Minus className="w-3 h-3" /></button>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        step={isFractionalEligible(item.product) ? "any" : "1"}
                                                        value={item.qty === 0 ? '' : item.qty}
                                                        onChange={(e) => {
                                                            let val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                if (!isFractionalEligible(item.product)) {
                                                                    val = Math.floor(val);
                                                                }
                                                                setExactQty(item.id, val);
                                                            }
                                                        }}
                                                        className="w-12 text-center text-sm font-black text-slate-800 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <button onClick={() => updateQty(item.id, 1)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <div className="text-sm font-bold text-indigo-600">
                                                    {formatCOP(totalItem)}
                                                </div>
                                                {recipe && (
                                                    <button 
                                                        onClick={toggleExpand}
                                                        className="ml-auto text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                                    >
                                                        {isExpanded ? 'Ocultar Receta' : 'Ver Receta'} <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* BOM Explosion Advanced View */}
                                            {recipe && isExpanded && (
                                                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Explosión de Materiales (BOM)</div>
                                                    <ul className="space-y-1">
                                                        {recipe.ingredients.map(ing => {
                                                            const ingProd = inventory.find(p => p.id === ing.productId);
                                                            const ingCost = (ingProd?.unitCost || 0) * (ing.quantity * item.qty);
                                                            return (
                                                                <li key={ing.productId} className="flex justify-between items-center text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-slate-700">{ingProd?.name || 'Desconocido'}</span>
                                                                        <span className="text-slate-400">x{(ing.quantity * item.qty * multiplier).toFixed(2)}</span>
                                                                    </div>
                                                                    <span className="font-medium text-slate-500">{formatCOP(ingCost)}</span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => updateQty(item.id, -item.qty)} 
                                            className="absolute top-3 right-3 p-1.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Smart Prompts Zone */}
                {smartAlerts.length > 0 && cart.length > 0 && (
                    <div className="px-4 pb-2">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-black uppercase text-amber-700 tracking-wider mb-1">Sugerencia del Sistema</div>
                                <div className="text-sm font-semibold text-amber-900 leading-tight">
                                    {smartAlerts[0]}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Totals & Actions */}
                <div className="bg-slate-900 text-white p-5 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative mt-2">
                    
                    {/* Margin Mode Toggle */}
                    <div className="absolute -top-4 right-6 bg-slate-800 border border-slate-700 rounded-full p-1 shadow-lg flex items-center">
                        <button 
                            onClick={() => setIsMarginMode(!isMarginMode)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isMarginMode ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" /> 
                            {isMarginMode ? 'Modo Rentabilidad ON' : 'Rentabilidad'}
                        </button>
                    </div>

                    <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-slate-400 text-sm font-medium">
                            <span>Subtotal</span>
                            <span>{formatCOP(subtotal)}</span>
                        </div>
                        {discountPercent > 0 && (
                            <div className="flex justify-between text-emerald-400 text-sm font-bold">
                                <span>Descuento {activeCustomer?.tier} ({discountPercent}%)</span>
                                <span>-{formatCOP(discountAmount)}</span>
                            </div>
                        )}
                        
                        {Object.entries(taxesBreakdown).map(([rate, amount]) => {
                            if (amount === 0) return null;
                            return (
                                <div key={rate} className="flex justify-between text-slate-400 text-sm font-medium">
                                    <span>IVA ({rate}%)</span>
                                    <span>{formatCOP(amount)}</span>
                                </div>
                            );
                        })}
                        {retenciones.reteFuente > 0 && (
                            <div className="flex justify-between text-rose-400 text-sm font-medium">
                                <span>ReteFuente ({RETEFUENTE_RATE}%)</span>
                                <span>-{formatCOP(retenciones.reteFuente)}</span>
                            </div>
                        )}
                        {retenciones.reteIca > 0 && (
                            <div className="flex justify-between text-rose-400 text-sm font-medium">
                                <span>ReteICA</span>
                                <span>-{formatCOP(retenciones.reteIca)}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-end">
                        <div className="text-slate-400 text-sm font-medium mb-1">Total a Pagar</div>
                        <div className="text-4xl font-black text-white tracking-tight">{formatCOP(total)}</div>
                    </div>

                    {/* Margin Simulator Panel */}
                    <AnimatePresence>
                        {isMarginMode && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-4 flex flex-col gap-4"
                            >
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Punto de Venta
                                        </label>
                                        <select 
                                            value={selectedPointOfSale} 
                                            onChange={e => setSelectedPointOfSale(e.target.value)}
                                            className="w-full text-sm font-semibold text-white bg-slate-800 border border-slate-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {pointsOfSale?.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" /> Forma de Pago
                                        </label>
                                        <select 
                                            value={selectedPaymentMethod} 
                                            onChange={e => setSelectedPaymentMethod(e.target.value)}
                                            className="w-full text-sm font-semibold text-white bg-slate-800 border border-slate-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {paymentMethods?.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase mb-2 flex items-center">
                                        <Calculator className="w-3.5 h-3.5 mr-1" /> Análisis de Margen Bruto
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xs text-slate-500 font-medium">Costo Base Lote</div>
                                            <div className="text-sm font-bold text-slate-300">{formatCOP(totalCost)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500 font-medium">Utilidad Bruta</div>
                                            <div className={`text-lg font-black ${marginPercent > 30 ? 'text-emerald-400' : marginPercent > 15 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                {formatCOP(grossMargin)} ({marginPercent.toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button className="py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <Receipt className="w-5 h-5" /> Cotizar
                        </button>
                        <button 
                            onClick={() => {
                                if (!isMarginMode) {
                                    setIsMarginMode(true);
                                } else {
                                    handleCheckout();
                                    setIsMarginMode(false);
                                }
                            }}
                            disabled={cart.length === 0}
                            className={`py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                                cart.length > 0 
                                ? (isMarginMode 
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] shadow-emerald-900/50' 
                                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] shadow-blue-900/50') 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {cart.length > 0 ? (
                                isMarginMode ? (
                                    <>Confirmar <ArrowRight className="w-5 h-5" /></>
                                ) : (
                                    <>Facturar <ArrowRight className="w-5 h-5" /></>
                                )
                            ) : (
                                'Carrito Vacío'
                            )}
                        </button>
                    </div>

                </div>

            </div>

            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-white rounded-3xl p-8 flex flex-col items-center max-w-sm w-full mx-4 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                                <Check className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 text-center mb-2">¡Venta Registrada!</h2>
                            <p className="text-slate-500 text-center text-sm font-medium mb-8">El recibo ha sido generado y el descuento simulado ha sido aplicado.</p>
                            
                            <button onClick={() => setShowSuccess(false)} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors">
                                Nueva Venta
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showExpenseModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-slate-200"
                        >
                            {/* Header */}
                            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-rose-400" />
                                    Registrar Gasto de Caja
                                </h3>
                                <button 
                                    onClick={() => setShowExpenseModal(false)} 
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                <div className="text-xs text-rose-800 bg-rose-50 border border-rose-100 p-3 rounded-xl font-medium">
                                    Este egreso se deducirá del saldo disponible en efectivo de la caja de <strong>{selectedPointOfSale || 'Principal'}</strong> en tiempo real.
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Concepto del Gasto</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Cafetería, Elementos de Aseo, Taxis..."
                                        value={expenseConcept}
                                        onChange={e => setExpenseConcept(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-rose-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Monto Pagado ($)</label>
                                        <input
                                            type="number"
                                            placeholder="Valor en COP"
                                            value={expenseAmount}
                                            onChange={e => setExpenseAmount(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-rose-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Tercero / Nit / Proveedor</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Supermercado El Éxito"
                                            value={expenseProvider}
                                            onChange={e => setExpenseProvider(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-rose-500"
                                        />
                                    </div>
                                </div>

                                {/* Drag and drop representation for invoice receipt upload */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Soporte Digital (Foto/Recibo/Factura)</label>
                                    {expenseFile ? (
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                            <span className="text-xs font-bold text-emerald-800 truncate max-w-[80%]">{expenseFile}</span>
                                            <button 
                                                onClick={() => setExpenseFile(null)}
                                                className="text-slate-400 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => setExpenseFile(`recibo_gasto_${Math.floor(1000 + Math.random() * 9000)}.png`)}
                                            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 cursor-pointer p-4 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-indigo-50/20 transition-all text-slate-400"
                                        >
                                            <UploadCloud className="w-6 h-6 text-slate-400 mb-1 animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-600">Simular Carga de Recibo</span>
                                            <span className="text-[9px] text-slate-400 mt-0.5">Formatos PDF, PNG, JPG</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setShowExpenseModal(false)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        addTransaction({
                                            id: `EG-${Math.floor(100000 + Math.random() * 900000)}`,
                                            date: new Date().toISOString().split('T')[0],
                                            type: 'COMPRA',
                                            client: expenseProvider || 'Caja POS',
                                            document: expenseFile || 'Soporte Digital',
                                            productName: `[POS - ${selectedPointOfSale || 'Principal'}] Gasto: ${expenseConcept || 'Egreso de Caja'}`,
                                            sku: 'N/A',
                                            qty: 1,
                                            total: Number(expenseAmount) || 0,
                                            iva: 0,
                                            paymentMethod: 'Caja Menor',
                                            posLocation: selectedPointOfSale || 'Principal',
                                            paymentStatus: 'PAGADA'
                                        });
                                        setShowExpenseModal(false);
                                    }}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-100 active:scale-95 transition-all"
                                >
                                    Confirmar Gasto
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shortcuts Modal */}
            <AnimatePresence>
                {showShortcutsModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4"
                        onClick={() => setShowShortcutsModal(false)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Info className="w-5 h-5"/> Atajos de Teclado</h3>
                                <button onClick={() => setShowShortcutsModal(false)} className="text-indigo-200 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    <li className="flex justify-between items-center"><span className="text-slate-600 font-medium text-sm">Buscar Cliente</span> <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold font-mono text-slate-700 shadow-sm">F2</kbd></li>
                                    <li className="flex justify-between items-center"><span className="text-slate-600 font-medium text-sm">Buscar Producto</span> <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold font-mono text-slate-700 shadow-sm">F7 / F10</kbd></li>
                                    <li className="flex justify-between items-center"><span className="text-slate-600 font-medium text-sm">Facturar / Pagar</span> <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold font-mono text-slate-700 shadow-sm">F8</kbd></li>
                                    <li className="flex justify-between items-center"><span className="text-slate-600 font-medium text-sm">Limpiar / Cancelar</span> <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold font-mono text-slate-700 shadow-sm">ESC</kbd></li>
                                    <li className="flex justify-between items-center"><span className="text-slate-600 font-medium text-sm">Borrar Línea Seleccionada</span> <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold font-mono text-slate-700 shadow-sm">Supr</kbd></li>
                                    <li className="flex justify-between items-center"><span className="text-slate-600 font-medium text-sm">Navegar Productos</span> <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold font-mono text-slate-700 shadow-sm">↑ / ↓</kbd></li>
                                    <li className="flex justify-between items-center"><span className="text-slate-600 font-medium text-sm">Modificar Cantidad</span> <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold font-mono text-slate-700 shadow-sm">+ / -</kbd></li>
                                </ul>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <datalist id="recent-colors">
                {recentColors.map(c => <option key={c} value={c} />)}
            </datalist>
        </div>
    );
};
