const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('../Lista de Precios ILVA ENERO 2026 Contado ( B ).pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('output.txt', data.text);
    console.log('PDF extracted successfully to output.txt');
}).catch(err => {
    console.error('Error extracting PDF:', err);
});
