import sys

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\CrmDealCreateModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Change the state type
text = text.replace("const [selectedQuantity, setSelectedQuantity] = useState<number | ''>('');", "const [selectedQuantity, setSelectedQuantity] = useState<string>('');")

# Change the input
old_input = """<input 
                  type="number" 
                  min="1" 
                  placeholder="Cant" 
                  value={selectedQuantity}
                  onChange={e => setSelectedQuantity(Number(e.target.value))}
                  className="w-20 text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 ring-indigo-500/20"
                />"""

new_input = """<input 
                  type="text" 
                  placeholder="Cant" 
                  value={selectedQuantity}
                  onChange={e => {
                      let val = e.target.value.replace(',', '.');
                      if (/^\\d*\\.?\\d*$/.test(val)) {
                          setSelectedQuantity(val);
                      }
                  }}
                  className="w-20 text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 ring-indigo-500/20"
                />"""

text = text.replace(old_input, new_input)

# Change the handleAddItem logic
old_handle = """  const handleAddItem = () => {
    if (!selectedProduct || !selectedQuantity) return;
    const prod = inventory.find(p => p.id === selectedProduct);
    if (!prod) return;

    setItems([...items, { productId: prod.id, name: prod.name, quantity: Number(selectedQuantity), unitPrice: prod.price }]);
    setSelectedQuantity('');
    setSelectedProduct('');
  };"""

new_handle = """  const handleAddItem = () => {
    if (!selectedProduct || !selectedQuantity) return;
    const prod = inventory.find(p => p.id === selectedProduct);
    if (!prod) return;
    
    const qty = parseFloat(selectedQuantity);
    if (isNaN(qty) || qty <= 0) return;

    setItems([...items, { productId: prod.id, name: prod.name, quantity: qty, unitPrice: prod.price }]);
    setSelectedQuantity('');
    setSelectedProduct('');
  };"""

text = text.replace(old_handle, new_handle)

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\CrmDealCreateModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated CrmDealCreateModal successfully')
