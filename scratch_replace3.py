import sys

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\SmartPosPanel.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

qty_input_component = """
const QtyInput: React.FC<{ item: any, setExactQty: (id: string, qty: number) => void }> = ({ item, setExactQty }) => {
    const [raw, setRaw] = React.useState(item.qty === 0 ? '' : item.qty.toString());
    
    React.useEffect(() => {
        const parsed = parseFloat(raw);
        if (parsed !== item.qty && !(raw === '' && item.qty === 0) && !(raw.endsWith('.') && parsed === item.qty)) {
            setRaw(item.qty === 0 ? '' : item.qty.toString());
        }
    }, [item.qty, raw]);

    return (
        <input 
            type="text" 
            value={raw}
            onChange={(e) => {
                let val = e.target.value.replace(',', '.');
                if (/^\\d*\\.?\\d*$/.test(val)) {
                    setRaw(val);
                    const num = parseFloat(val);
                    if (!isNaN(num)) {
                        setExactQty(item.id, num);
                    } else if (val === '') {
                        setExactQty(item.id, 0);
                    }
                }
            }}
            className="w-12 text-center text-sm font-black text-slate-800 bg-transparent outline-none"
        />
    );
};
"""

old_input = """<input 
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
                                                    />"""

new_input = '<QtyInput item={item} setExactQty={setExactQty} />'

if old_input in text:
    text = text.replace(old_input, new_input)
    text = text.replace('export const SmartPosPanel: React.FC = () => {', qty_input_component + '\\nexport const SmartPosPanel: React.FC = () => {')
    with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\components\SmartPosPanel.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Replaced QtyInput in SmartPosPanel successfully')
else:
    print('Old input not found in SmartPosPanel')
