const fs = require('fs');
const path = require('path');

const contextPath = path.join(__dirname, '..', 'context', 'EnterpriseContext.tsx');
let content = fs.readFileSync(contextPath, 'utf8');

// 1. Interface
if (!content.includes('addInventoryProduct: (product: Product) => void;')) {
    content = content.replace(
        'updateInventoryProduct: (productId: string, updates: Partial<Product>) => void;',
        'addInventoryProduct: (product: Product) => void;\n    updateInventoryProduct: (productId: string, updates: Partial<Product>) => void;'
    );
    console.log('Added addInventoryProduct to interface');
}

// 2. Implementation
const oldImpl = `    const updateInventoryProduct = (productId: string, updates: Partial<Product>) => {
        setInventory(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    };`;

const newImpl = `    const addInventoryProduct = (newProduct: Product) => {
        setInventory(prev => [newProduct, ...prev]);
        addToast({
            title: 'Producto Creado',
            message: \`El producto \${newProduct.name} (\${newProduct.sku}) fue registrado exitosamente en el catálogo.\`,
            severity: 'SUCCESS'
        });
    };

    const updateInventoryProduct = (productId: string, updates: Partial<Product>) => {
        setInventory(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    };`;

const normalize = str => str.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(oldImpl))) {
    const parts = normalize(content).split(normalize(oldImpl));
    content = parts.join(normalize(newImpl));
    console.log('Added addInventoryProduct implementation');
} else {
    console.log('oldImpl not matched directly');
}

// 3. Provider value
if (!content.includes('addInventoryProduct,')) {
    content = content.replace(
        'updateInventoryProduct,',
        'addInventoryProduct,\n            updateInventoryProduct,'
    );
    console.log('Added addInventoryProduct to provider value');
}

fs.writeFileSync(contextPath, content, 'utf8');
console.log('EnterpriseContext.tsx updated successfully');
