import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_INVENTORY, MOCK_CRM_DEALS, MOCK_EVENT_LOG, MOCK_CRM_CONTACTS, MOCK_CRM_ACTIVITIES, MOCK_CRM_USERS, MOCK_CRM_SETTINGS } from '../constants';
import { Product, CrmDeal, SystemEvent, CrmContact, CrmActivity, CrmDealStage, InboundReceipt, CrmUser, CrmSettings, CrmPostSaleStage, CrmAssignmentLog, CrmNotification } from '../types';

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
    tintometricRules: string[];
    updateTintometricRules: (rules: string[]) => void;
    reverseDisplayRules: string[];
    updateReverseDisplayRules: (rules: string[]) => void;
    assignmentLogs: CrmAssignmentLog[];
    cleanGarbageLeads: (daysInactive: number) => void;
    getActiveNotifications: () => CrmNotification[];
    globalSelectedContactId: string | null;
    setGlobalSelectedContactId: (id: string | null) => void;
    fullProfileContactId: string | null;
    setFullProfileContactId: (id: string | null) => void;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [inventory, setInventory] = useState<Product[]>(MOCK_INVENTORY);
    const [deals, setDeals] = useState<CrmDeal[]>(MOCK_CRM_DEALS);
    const [contacts, setContacts] = useState<CrmContact[]>(MOCK_CRM_CONTACTS);
    const [activities, setActivities] = useState<CrmActivity[]>(MOCK_CRM_ACTIVITIES);
    const [events, setEvents] = useState<SystemEvent[]>(MOCK_EVENT_LOG);
    const [crmUsers, setCrmUsers] = useState<CrmUser[]>(MOCK_CRM_USERS);
    const [crmSettings, setCrmSettings] = useState<CrmSettings>(MOCK_CRM_SETTINGS);
    const [receipts, setReceipts] = useState<InboundReceipt[]>([]);
    const [assignmentLogs, setAssignmentLogs] = useState<CrmAssignmentLog[]>([]);
    
    // Tintometric Rules
    const [tintometricRules, setTintometricRules] = useState<string[]>([
        'PL 800', 'PM 800', 'TP 60', 'PL 720/10', 'TO 800', 'TO 840/10',
        'TINTILLA DE COLORES DESARROLADOS',
        'TINTILLA HIDROSOLUBLES',
        'TINTILLA COLORES BASE BLANCA',
        'TINTILLA SEMIPIGMENTARIA'
    ]);
    
    // Reverse Display Rules
    const [reverseDisplayRules, setReverseDisplayRules] = useState<string[]>([
        'VETRO',
        'VET',
        'LACA CATALIZA',
        'PROCOQUINAL',
        'PF 45'
    ]);

    const [globalSelectedContactId, setGlobalSelectedContactId] = useState<string | null>(null);
    const [fullProfileContactId, setFullProfileContactId] = useState<string | null>(null);

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
            tintometricRules,
            updateTintometricRules,
            reverseDisplayRules,
            setReverseDisplayRules,
            updateReverseDisplayRules: setReverseDisplayRules,
            assignmentLogs,
            cleanGarbageLeads,
            getActiveNotifications,
            globalSelectedContactId,
            setGlobalSelectedContactId,
            fullProfileContactId,
            setFullProfileContactId
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
