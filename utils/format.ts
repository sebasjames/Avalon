/**
 * Formats a number to Colombian Peso (COP) style.
 * Uses dot (.) as thousands separator and single quote (') as millions separator.
 * Example: 1234567 -> $1'234.567
 */
export const formatCOP = (num: number): string => {
    if (num === undefined || num === null || isNaN(num)) return '$0';
    const rounded = Math.round(num);
    const absVal = Math.abs(rounded);
    const str = absVal.toString();
    
    let result = '';
    let count = 0;
    for (let i = str.length - 1; i >= 0; i--) {
        if (count > 0 && count % 3 === 0) {
            if (count === 6) {
                result = "'" + result;
            } else if (count === 12) {
                result = "'" + result;
            } else {
                result = "." + result;
            }
        }
        result = str[i] + result;
        count++;
    }
    return (rounded < 0 ? '-$' : '$') + result;
};
