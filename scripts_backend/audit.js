import * as fs from 'fs';

try {
    const fileContent = fs.readFileSync('constants.ts', 'utf8');
    const match = fileContent.match(/export const MOCK_INVENTORY:\s*Product\[\]\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) throw new Error("No se encontró MOCK_INVENTORY");
    
    const dataStr = match[1]
        .replace(/Category\.[A-Z_]+/g, '"FINISHED_GOOD"')
        .replace(/InventoryStatus\.[A-Z_]+/g, '"ACTIVE"')
        .replace(/ABCClass\.[A-Z_]+/g, '"A"')
        .replace(/XYZClass\.[A-Z_]+/g, '"X"');
    
    const inventory = eval('(' + dataStr + ')');

    console.log("=========================================");
    console.log("       AUDITORÍA INTEGRAL COMPLETA       ");
    console.log("=========================================\n");

    let errors = [];
    let warnings = [];

    // 1. Integridad de Datos (Campos vacíos, nulos)
    const ids = new Set();
    const skus = new Set();
    
    inventory.forEach((p, index) => {
        if (!p.id) errors.push(`Producto en índice ${index} no tiene ID.`);
        if (!p.sku) errors.push(`Producto ${p.id} no tiene SKU.`);
        if (!p.name) errors.push(`Producto ${p.sku} no tiene Nombre.`);
        if (!p.baseUnit) errors.push(`Producto ${p.sku} no tiene Unidad Base.`);
        
        if (ids.has(p.id)) errors.push(`ID Duplicado encontrado: ${p.id}`);
        ids.add(p.id);

        if (skus.has(p.sku)) errors.push(`SKU Duplicado encontrado: ${p.sku}`);
        skus.add(p.sku);
    });

    // 2. Integridad Estructural (Familias y Variantes)
    const baseToVariants = {};
    inventory.forEach(p => {
        let baseSku = p.originalSku;
        if (/^(?:D-101|D-103)/.test(p.originalSku)) baseSku = p.originalSku.replace(/(GL|LT|TB|CU|QT)$/, '');
        else baseSku = p.originalSku.replace(/( GL| QT|-GL|-QT|-CU|-LT|-TB| CU| LT| L| 1\/4)$/, '').trim();

        if (!baseToVariants[baseSku]) baseToVariants[baseSku] = { family: p.family, skus: [] };
        baseToVariants[baseSku].skus.push(p.originalSku);
    });

    for (const [base, info] of Object.entries(baseToVariants)) {
        const hasBase = info.skus.some(s => s === base);
        if (!hasBase) {
            errors.push(`Falta base estructural para la familia: ${base} (Variantes: ${info.skus.join(', ')})`);
        }
    }

    console.log(`[1] Total Productos Cargados: ${inventory.length}`);
    console.log(`[2] Total Familias Raíz (Bases Mapeadas): ${Object.keys(baseToVariants).length}`);
    console.log(`[3] Evaluación de SKUs Duplicados: ${skus.size === inventory.length ? 'PERFECTO (0 Duplicados)' : 'FALLÓ'}`);
    console.log(`[4] Evaluación de IDs Únicos: ${ids.size === inventory.length ? 'PERFECTO (0 Duplicados)' : 'FALLÓ'}`);
    
    const missingData = inventory.filter(p => !p.name || !p.sku || !p.baseUnit);
    console.log(`[5] Evaluación de Datos Nulos: ${missingData.length === 0 ? 'PERFECTO (Todo el catálogo tiene nombre, sku y unidad)' : 'FALLÓ'}`);

    console.log("\n=== REPORTE DE ERRORES CRÍTICOS ===");
    if (errors.length === 0) {
        console.log("✅ 0 ERRORES. El catálogo es 100% íntegro y seguro para producción.");
    } else {
        errors.forEach(e => console.log(`❌ ${e}`));
    }

    if (warnings.length > 0) {
        console.log("\n=== ADVERTENCIAS MENORES ===");
        warnings.forEach(w => console.log(`⚠️ ${w}`));
    }

} catch(e) {
    console.error("Error durante auditoría:", e);
}
