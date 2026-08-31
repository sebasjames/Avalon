const fs = require('fs');

const tabPath = 'components/accounting/CajaMenorTab.tsx';
let tab = fs.readFileSync(tabPath, 'utf-8');

// Find the first "const FONDO_BASE" after "return ("
const returnIdx = tab.indexOf("    return (");
if (returnIdx !== -1) {
    const renderContent = tab.substring(returnIdx + "    return (".length);
    
    // Find the JSX start inside renderContent
    // The JSX starts with <div className="bg-white rounded-2xl
    const jsxStartIdx = renderContent.indexOf('<div className="bg-white');
    if (jsxStartIdx !== -1) {
        // Everything before jsxStartIdx is logic that should go BEFORE return(
        const logic = renderContent.substring(0, jsxStartIdx).replace(/^\\s*/, '');
        const jsx = renderContent.substring(jsxStartIdx);
        
        tab = tab.substring(0, returnIdx) + "\\n" + logic + "\\n    return (\\n" + jsx;
        fs.writeFileSync(tabPath, tab);
        console.log("Fixed CajaMenorTab logic placement!");
    } else {
        console.log("JSX start not found");
    }
}
