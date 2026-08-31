const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\James\\Scarpian AI\\Projects\\Procoquinal\\Avalon_V1';
const extractionDirs = [
    'raw_json_extractions',
    'raw_json_extractions_barpimo',
    'raw_json_extractions_ilva',
    'raw_json_extractions_procoquinal'
];

let totalFiles = 0;
let jsonStructureMap = {};
let sampleMixData = [];

function analyzeJson(filePath, folderName) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        totalFiles++;

        // Recursive function to extract all keys
        function extractKeys(obj, prefix = '') {
            let keys = [];
            if (Array.isArray(obj)) {
                if (obj.length > 0 && typeof obj[0] === 'object') {
                    keys = keys.concat(extractKeys(obj[0], prefix + '[]'));
                }
            } else if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    keys.push(fullKey);
                    
                    // Check if the key or its string value relates to mixing
                    const keyLower = key.toLowerCase();
                    const val = obj[key];
                    if (['mezcla', 'mix', 'catalizador', 'catalyst', 'proporcion', 'proporción', 'solvente', 'diluyente', 'ratio'].some(k => keyLower.includes(k))) {
                        sampleMixData.push({ folder: folderName, file: path.basename(filePath), key: fullKey, value: val });
                    }
                    
                    if (typeof val === 'string' && val.length < 200) {
                         const valLower = val.toLowerCase();
                         if (['%', 'partes', 'ratio'].some(k => valLower.includes(k)) && 
                             ['mezcla', 'catalizador', 'solvente', 'diluyente'].some(k => valLower.includes(k))) {
                              sampleMixData.push({ folder: folderName, file: path.basename(filePath), key: fullKey, value: val });
                         }
                    }

                    keys = keys.concat(extractKeys(obj[key], fullKey + '.'));
                }
            }
            return keys;
        }

        const keys = extractKeys(data);
        const uniqueKeys = [...new Set(keys)];

        if (!jsonStructureMap[folderName]) {
            jsonStructureMap[folderName] = { filesCount: 0, keyFrequencies: {} };
        }
        
        jsonStructureMap[folderName].filesCount++;
        uniqueKeys.forEach(k => {
            jsonStructureMap[folderName].keyFrequencies[k] = (jsonStructureMap[folderName].keyFrequencies[k] || 0) + 1;
        });

    } catch (e) {
        console.error(`Error processing ${filePath}:`, e.message);
    }
}

extractionDirs.forEach(dirName => {
    const fullPath = path.join(rootDir, dirName);
    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                analyzeJson(path.join(fullPath, file), dirName);
            }
        });
    }
});

// Write summary
const summaryFile = path.join(rootDir, 'Avalon_V1_CODE', 'scratch', 'extractions_analysis.json');
fs.writeFileSync(summaryFile, JSON.stringify({
    totalFilesProcessed: totalFiles,
    structures: jsonStructureMap,
    mixDataSamples: sampleMixData.slice(0, 50) // save top 50 matches to inspect
}, null, 2));

console.log(`Analysis complete. Processed ${totalFiles} files. Results saved to scratch/extractions_analysis.json`);
