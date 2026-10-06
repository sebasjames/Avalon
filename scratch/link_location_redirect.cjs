const fs = require('fs');
const path = require('path');

// 1. Update InventoryHub.tsx
const hubPath = path.resolve(__dirname, '../components/InventoryHub.tsx');
let hubCode = fs.readFileSync(hubPath, 'utf8');

if (!hubCode.includes("import { useNavigate }")) {
    hubCode = hubCode.replace(
        "import React, { useState } from 'react';",
        "import React, { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';"
    );
}

if (!hubCode.includes("const navigate = useNavigate();")) {
    hubCode = hubCode.replace(
        "const [segmentFilter, setSegmentFilter] = useState<string>('ALL');",
        "const [segmentFilter, setSegmentFilter] = useState<string>('ALL');\n    const navigate = useNavigate();"
    );
}

// Replace button onClick
hubCode = hubCode.replace(
    /onClick=\{\(\) => \{[\s\S]*?alert\("Ve a Configuración > Locaciones para administrar las bodegas\."\);[\s\S]*?\}\}/,
    `onClick={() => {\n                                navigate('/config?tab=locaciones&new=true');\n                            }}`
);
hubCode = hubCode.replace(
    'title="Configurar Locaciones"',
    'title="Configurar Sedes y Bodegas" className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all ml-1 border border-transparent hover:border-slate-200/50 cursor-pointer"'
);

fs.writeFileSync(hubPath, hubCode, 'utf8');
console.log('Updated InventoryHub.tsx');

// 2. Update Configuration.tsx
const configPath = path.resolve(__dirname, '../components/Configuration.tsx');
let configCode = fs.readFileSync(configPath, 'utf8');

if (!configCode.includes("useSearchParams")) {
    configCode = configCode.replace(
        "import React, { useState, useEffect, useMemo } from 'react';",
        "import React, { useState, useEffect, useMemo } from 'react';\nimport { useSearchParams, useLocation } from 'react-router-dom';"
    );
}

const tabTarget = "const [activeTab, setActiveTab] = useState<'inventario' | 'produccion' | 'formulas' | 'ventas' | 'compras' | 'finanzas' | 'impuestos' | 'reglas' | 'contabilidad' | 'usuarios' | 'proveedores' | 'locaciones' | 'integraciones' | 'worldoffice' | 'demo'>('worldoffice');";
const tabReplacement = `const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialTab = (searchParams.get('tab') || location.state?.tab || 'worldoffice') as any;
  const [activeTab, setActiveTab] = useState<'inventario' | 'produccion' | 'formulas' | 'ventas' | 'compras' | 'finanzas' | 'impuestos' | 'reglas' | 'contabilidad' | 'usuarios' | 'proveedores' | 'locaciones' | 'integraciones' | 'worldoffice' | 'demo'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab') || location.state?.tab;
    if (tabParam) {
      setActiveTab(tabParam as any);
      if (tabParam === 'locaciones' && searchParams.get('new') === 'true') {
        setEditingLocationId('NEW');
        setLocationForm({ status: 'Activa', type: 'Punto de Venta' });
      }
    }
  }, [searchParams, location.state]);`;

if (configCode.includes(tabTarget)) {
    configCode = configCode.replace(tabTarget, tabReplacement);
    console.log('Updated Configuration.tsx activeTab handling');
}

fs.writeFileSync(configPath, configCode, 'utf8');
console.log('Updated Configuration.tsx');
