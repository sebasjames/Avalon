import sys
import re

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\SmartPosPanel.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add addDispatch to useEnterprise
text = text.replace(
    'productionOrders, addProductionOrder\n    } = useEnterprise();',
    'productionOrders, addProductionOrder, addDispatch\n    } = useEnterprise();'
)

# 2. Add local storage logic to cart
text = text.replace(
    'const [cart, setCart] = useState<CartItem[]>([]);',
    '''const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('POS_CART');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    useEffect(() => { localStorage.setItem('POS_CART', JSON.stringify(cart)); }, [cart]);'''
)

# 3. Add local storage logic to selectedCustomerId
text = text.replace(
    "const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');",
    '''const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => localStorage.getItem('POS_CUSTOMER') || '');
    useEffect(() => { localStorage.setItem('POS_CUSTOMER', selectedCustomerId); }, [selectedCustomerId]);'''
)

# 4. Inject addDispatch inside executeCheckout
add_dispatch_logic = """
            // --- GENERATE DISPATCH MODULE ORDER ---
            try {
                addDispatch({
                    id: `DSP-POS-${invoiceId.slice(-4)}-${Math.floor(Math.random() * 1000)}`,
                    dealId: invoiceId,
                    contactId: activeCustomer ? activeCustomer.id : 'C-000',
                    status: 'PENDIENTE',
                    promisedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    items: receiptCartItems.map(item => ({
                        sku: item.sku || 'N/A',
                        productName: item.name,
                        orderedQty: item.qty,
                        deliveredQty: 0
                    }))
                });
            } catch(e) { console.error('Dispatch creation error', e); }

            setCompletedReceiptData(receiptPayload);"""

text = text.replace("setCompletedReceiptData(receiptPayload);", add_dispatch_logic)

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\SmartPosPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated SmartPosPanel.tsx successfully with local cache and dispatch trigger.')
