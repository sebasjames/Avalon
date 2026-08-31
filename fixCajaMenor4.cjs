const fs = require('fs');

const tabPath = 'components/accounting/CajaMenorTab.tsx';
let tab = fs.readFileSync(tabPath, 'utf-8');

// Strip out the IIFE wrapper: "return (\n() => {" ... ")();"
tab = tab.replace("    return (\\n() => {", "    const [cmHistoryDateFrom, setCmHistoryDateFrom] = useState('');\\n    const [cmHistoryDateTo, setCmHistoryDateTo] = useState('');\\n    const [cmHistorySku, setCmHistorySku] = useState('');\\n    const [cmHistoryMinPrice, setCmHistoryMinPrice] = useState('');\\n    const [cmHistoryMaxPrice, setCmHistoryMaxPrice] = useState('');\\n\\n    return (");

// Remove the end of the IIFE if it exists (which we already stripped but let's be sure)
tab = tab.replace("                            \\n    );\\n};\\n", "    );\\n};\\n");
fs.writeFileSync(tabPath, tab);

const modulePath = 'components/AccountingModule.tsx';
let content = fs.readFileSync(modulePath, 'utf-8');
const strToRemove = [
    "    const \\[cmHistoryDateFrom, setCmHistoryDateFrom\\] = useState\\(''\\);\\r?\\n",
    "    const \\[cmHistoryDateTo, setCmHistoryDateTo\\] = useState\\(''\\);\\r?\\n",
    "    const \\[cmHistorySku, setCmHistorySku\\] = useState\\(''\\);\\r?\\n",
    "    const \\[cmHistoryMinPrice, setCmHistoryMinPrice\\] = useState\\(''\\);\\r?\\n",
    "    const \\[cmHistoryMaxPrice, setCmHistoryMaxPrice\\] = useState\\(''\\);\\r?\\n"
];
for (const str of strToRemove) {
    content = content.replace(new RegExp(str), '');
}
fs.writeFileSync(modulePath, content);
console.log("Fixed CajaMenorTab and AccountingModule");
