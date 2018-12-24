const fs = require('fs'), 
    espree = require('espree');

const file = process.argv[2];

const data = fs.readFileSync(file);

const parserOptions = {
    ecmaVersion: 8, 
    range: true,
    loc: true,
    tokens: false,
    sourceType: "module"
};

const tree = espree.parse(data, parserOptions);
console.log( JSON.stringify(tree) );
