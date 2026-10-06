const fs = require('fs');
const path = require('path');

const tablePath = path.resolve(__dirname, '../components/InventoryTable.tsx');
let code = fs.readFileSync(tablePath, 'utf8');

// Add import useEnterprise if not present
if (!code.includes("import { useEnterprise }")) {
    code = code.replace(
        "import { INVENTORY_DATA } from '../constants';",
        "import { INVENTORY_DATA } from '../constants';\nimport { useEnterprise } from '../context/EnterpriseContext';"
    );
}

// Hook into component
if (!code.includes("const { inventory } = useEnterprise();")) {
    code = code.replace(
        "export const InventoryTable: React.FC = () => {",
        "export const InventoryTable: React.FC = () => {\n  const { inventory } = useEnterprise();\n  const rawData = inventory && inventory.length > 0 ? inventory : INVENTORY_DATA;"
    );
    code = code.replace(
        "const filteredData = INVENTORY_DATA.filter(item => {",
        "const filteredData = rawData.filter(item => {"
    );
}

fs.writeFileSync(tablePath, code, 'utf8');
console.log('InventoryTable.tsx updated to use live inventory context!');
