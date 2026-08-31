const fs = require('fs');
let content = fs.readFileSync('components/accounting/CajaMenorTab.tsx', 'utf-8');

const states = `    const { inventory, updateInventoryStock, addTransaction, pointsOfSale } = require('../../context/EnterpriseContext').useEnterprise();
    const [cmHistoryDateFrom, setCmHistoryDateFrom] = useState('');
    const [cmHistoryDateTo, setCmHistoryDateTo] = useState('');
    const [cmHistorySku, setCmHistorySku] = useState('');
    const [cmHistoryMinPrice, setCmHistoryMinPrice] = useState('');
    const [cmHistoryMaxPrice, setCmHistoryMaxPrice] = useState('');
    const [egresoTercero, setEgresoTercero] = useState('');
    const [egresoConcepto, setEgresoConcepto] = useState('');
    const [egresoValor, setEgresoValor] = useState('');
    const [egresoType, setEgresoType] = useState('GASTO');
    const [egresoSku, setEgresoSku] = useState('');
    const [egresoCantidad, setEgresoCantidad] = useState('');
    const [egresoFecha, setEgresoFecha] = useState(new Date().toISOString().split('T')[0]);
`;

content = content.replace('const FONDO_BASE = 2000000; // $2,000,000 COP', states);

fs.writeFileSync('components/accounting/CajaMenorTab.tsx', content);
