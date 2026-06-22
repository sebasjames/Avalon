const fs = require('fs');

const path = './constants.ts';
let data = fs.readFileSync(path, 'utf8');

// The pattern is usually:
// "batches": []
// },
// OR
// "batches": []
// }

let matchCount = 0;
data = data.replace(/"batches":\s*\[\]/g, (match) => {
    matchCount++;
    return '"batches": [],\n      "taxRate": 19';
});

console.log(`Matched ${matchCount} items.`);
fs.writeFileSync(path, data, 'utf8');
console.log('Done!');
