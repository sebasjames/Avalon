import sys

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\SmartPosPanel.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add local storage logic to cart
old_cart = "const [cart, setCart] = useState<{ id: string; product: Product; qty: number; colorNote?: string; mixGroupId?: string; }[]>([]);"
new_cart = """const [cart, setCart] = useState<{ id: string; product: Product; qty: number; colorNote?: string; mixGroupId?: string; }[]>(() => {
        try {
            const saved = localStorage.getItem('POS_CART');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    useEffect(() => { localStorage.setItem('POS_CART', JSON.stringify(cart)); }, [cart]);"""

if old_cart in text:
    text = text.replace(old_cart, new_cart)
    print("Cart replace success")
else:
    print("Cart replace FAIL")

# 2. Add local storage logic to selectedCustomerId
old_cust = "const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');"
new_cust = """const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => localStorage.getItem('POS_CUSTOMER') || '');
    useEffect(() => { localStorage.setItem('POS_CUSTOMER', selectedCustomerId); }, [selectedCustomerId]);"""

if old_cust in text:
    text = text.replace(old_cust, new_cust)
    print("Customer replace success")
else:
    print("Customer replace FAIL")

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\SmartPosPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
