const fs = require('fs');
const path = require('path');

const hubPath = path.resolve(__dirname, '../components/InventoryHub.tsx');
let code = fs.readFileSync(hubPath, 'utf8');

code = code.replace(
    `                        <button \n                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all ml-1 border border-transparent hover:border-slate-200/50"\n                            title="Configurar Sedes y Bodegas" className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all ml-1 border border-transparent hover:border-slate-200/50 cursor-pointer"`,
    `                        <button \n                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all ml-1 border border-transparent hover:border-slate-200/50 cursor-pointer"\n                            title="Configurar Sedes y Bodegas"`
);

fs.writeFileSync(hubPath, code, 'utf8');
console.log('Fixed button attributes in InventoryHub.tsx');
