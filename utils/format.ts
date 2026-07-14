export const formatCOP = (num: number, includeDecimals = false): string => {
    if (num === undefined || num === null || isNaN(num)) {
        return includeDecimals ? '$ 0,00 COP' : '$ 0 COP';
    }
    const isNegative = num < 0;
    const absVal = Math.abs(num);
    
    let integerPart: string;
    let decimalPart = '';
    
    if (includeDecimals) {
        const parts = absVal.toFixed(2).split('.');
        integerPart = parts[0];
        decimalPart = ',' + parts[1];
    } else {
        integerPart = Math.round(absVal).toString();
    }
    
    let result = '';
    let count = 0;
    const rev = integerPart.split('').reverse();
    for (let i = 0; i < rev.length; i++) {
        if (i > 0 && i % 3 === 0) {
            count++;
            if (count % 2 === 0) {
                // Millions (6th digit, 12th digit, etc.)
                result = '´' + result;
            } else {
                // Thousands (3rd digit, 9th digit, etc.)
                result = '.' + result;
            }
        }
        result = rev[i] + result;
    }
    
    return `${isNegative ? '-' : ''}$ ${result}${decimalPart} COP`;
};
