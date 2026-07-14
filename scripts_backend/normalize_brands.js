import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
let updateCount = 0;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('brand:')) {
        if (lines[i].includes('"Barpimo"')) {
            lines[i] = lines[i].replace('"Barpimo"', '"BARPIMO"');
            updateCount++;
        } else if (lines[i].includes("'Barpimo'")) {
            lines[i] = lines[i].replace("'Barpimo'", "'BARPIMO'");
            updateCount++;
        } else if (lines[i].includes('"Procoquinal"')) {
            lines[i] = lines[i].replace('"Procoquinal"', '"PROCOQUINAL"');
            updateCount++;
        } else if (lines[i].includes("'Procoquinal'")) {
            lines[i] = lines[i].replace("'Procoquinal'", "'PROCOQUINAL'");
            updateCount++;
        }
    }
}

fs.writeFileSync(constantsPath, lines.join('\n'));
console.log(`Normalized ${updateCount} brand names.`);
