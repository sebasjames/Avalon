import pdfplumber
import sys

pdf_path = '../Lista de Precios ILVA ENERO 2026 Contado ( B ).pdf'
text_lines = []

try:
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_lines.append(text)
                
    with open('output.txt', 'w', encoding='utf-8') as f:
        f.write('\n---PAGE---\n'.join(text_lines))
        
    print("Extraction successful")
except Exception as e:
    print(f"Error: {e}")
