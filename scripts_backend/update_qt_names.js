import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
const newLines = [];
let currentProductLines = [];
let insideProduct = false;
let updateCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!insideProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        insideProduct = true;
        currentProductLines = [line];
        continue;
    }

    if (insideProduct) {
        currentProductLines.push(line);

        if (line.trim() === '},' || line.trim() === '}') {
            insideProduct = false;
            
            // Check if this product needs updating
            let hasQt = false;
            let nameLineIndex = -1;
            let oldName = '';
            
            for (let j = 0; j < currentProductLines.length; j++) {
                if (currentProductLines[j].includes('sku:')) {
                    const match = currentProductLines[j].match(/sku:\s*['"]([^'"]+)['"]/);
                    if (match && match[1].includes('QT')) hasQt = true;
                }
                if (currentProductLines[j].includes('name:')) {
                    nameLineIndex = j;
                    const match = currentProductLines[j].match(/name:\s*['"]([^'"]+)['"]/);
                    if (match) {
                        oldName = match[1];
                        if (oldName.includes('QT') || oldName.includes('1/4 GALÓN')) hasQt = true;
                    }
                }
            }

            if (hasQt && nameLineIndex !== -1) {
                // Update the name
                let newName = oldName;
                if (newName.includes('- 1/4 GALÓN')) {
                    newName = newName.replace('- 1/4 GALÓN', '- 1/4 (QT)');
                } else if (newName.includes('1/4 GALÓN')) {
                    newName = newName.replace('1/4 GALÓN', '1/4 (QT)');
                } else if (!newName.includes('1/4 (QT)')) {
                    newName = newName + ' - 1/4 (QT)';
                }

                if (newName !== oldName) {
                    currentProductLines[nameLineIndex] = currentProductLines[nameLineIndex].replace(oldName, newName);
                    updateCount++;
                }
            }
            
            newLines.push(...currentProductLines);
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync(constantsPath, newLines.join('\n'));
console.log(`Updated ${updateCount} product names to include 1/4 (QT).`);
