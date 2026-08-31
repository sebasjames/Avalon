const fs = require('fs');

const p = 'data/inventory.ts';
let lines = fs.readFileSync(p, 'utf-8').split('\\n');
let newLines = [];
let removed = 0;

for (let line of lines) {
    if (line.match(/^\\s*density:\\s*"[\\d\\.]+",?\\r?$/)) {
        removed++;
        continue;
    }
    newLines.push(line);
}

fs.writeFileSync(p, newLines.join('\\n'));
console.log('Removed ' + removed + ' lines of string density.');
