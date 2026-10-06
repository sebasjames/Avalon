import sys

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\context\EnterpriseContext.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add Pendiente Facturar to default methods
old_methods = """const [paymentMethods, setPaymentMethods] = useState<string[]>([
        'Efectivo',
        'Tarjeta',
        'Transferencia',
        'Nequi',
        'Crédito 30 días',
        'Crédito 60 días',
        'Crédito 90 días',
        'Saldo a Favor',
        'Muestra'
    ]);"""

new_methods = """const [paymentMethods, setPaymentMethods] = useState<string[]>([
        'Efectivo',
        'Tarjeta',
        'Transferencia',
        'Nequi',
        'Crédito 30 días',
        'Crédito 60 días',
        'Crédito 90 días',
        'Saldo a Favor',
        'Muestra',
        'Pendiente Facturar'
    ]);"""

# Replace ignoring encoding weirdness by just string replacement, 
# But python might have read the file with .
# Better to do a string replace on a partial match.
text = text.replace("'Muestra'\n    ]);", "'Muestra',\n        'Pendiente Facturar'\n    ]);")

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\context\EnterpriseContext.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated EnterpriseContext payment methods")
