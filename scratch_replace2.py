import sys

path = r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\context\EnterpriseContext.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    const moveDealStage = (dealId: string, newStage: CrmDealStage | 'CLOSED_LOST', lostReason?: string) => {
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
                    });"""

replacement = """    const moveDealStage = (dealId: string, newStage: CrmDealStage | 'CLOSED_LOST', lostReason?: string) => {
        setDeals(prevDeals => prevDeals.map(deal => {
            if (deal.id === dealId) {
                // Feature: Integración Fluida CRM -> Inventario
                if (newStage === 'CLOSED_WON' && deal.stage !== 'CLOSED_WON') {
                    if (deal.items && deal.items.length > 0) {
                        // Reservar inventario basado en los items del deal
                        setInventory(prevInv => {
                            const newInv = [...prevInv];
                            const newEvents = [];
                            
                            for (const item of deal.items) {
                                const pIdx = newInv.findIndex(p => p.id === item.productId);
                                if (pIdx !== -1) {
                                    const product = newInv[pIdx];
                                    const qtyToReserve = item.quantity;
                                    newInv[pIdx] = {
                                        ...product,
                                        reservedStock: product.reservedStock + qtyToReserve
                                    };
                                    
                                    newEvents.push({
                                        event_id: `EVT-${Date.now()}-${product.sku}`,
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
                                    });
                                }
                            }
                            if (newEvents.length > 0) {
                                setEvents(e => [...newEvents, ...e]);
                            }
                            return newInv;
                        });
                    }"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced successfully')
else:
    print('Target not found')
