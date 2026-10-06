import sys

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("const MezclasTablero = React.lazy(() => import('./components/MezclasTablero').then(m => ({ default: m.MezclasTablero })));",
                    "const OperationsHub = React.lazy(() => import('./components/OperationsHub').then(m => ({ default: m.OperationsHub })));")

text = text.replace("<Route path=\"/mezclas\" element={<MezclasTablero />} />", "<Route path=\"/mezclas\" element={<OperationsHub />} />")

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated App.tsx successfully')
