const fs = require('fs'),
    espree = require('espree'),
    estraverse = require('estraverse');

const parser = require('./lib/baseParser');

const file = process.argv[2];

const data = fs.readFileSync(file);

const parserOptions = {
    ecmaVersion: 8,
    range: true,
    loc: true,
    comment: true,
    tokens: false,
    sourceType: "module"
};

const tree = espree.parse(data, parserOptions);

const functionMap = parser.parse(data);

/* 
 data to gather
 - lib/jsmeter/jsmeter.js (Anonymous1).runJsmeter.out.write
 - statements: 1  
 - lines:      2   
 - comments:   0       
 - % comments:   NaN    
 - branches: 0          
 - depth: 0        
 - complexity: 1  
   = complexity =  exits − N P 
   = https://en.wikipedia.org/wiki/Cyclomatic_complexity
 - Halstead Volume: 15.8     
 - Halstead Potential: 8      
 - Program Level: 0.506      
 - MI Volume: 150.1
*/
const computedResults = functionMap.map(item => {

    const result = {
        file: file,
        functionName: item.name,
        startLine: item.loc.start.line,
        endLine: item.loc.end.line,
        lines: (item.loc.end.line - item.loc.start.line)
    };

    console.log('BEGIN -------------------------');
    console.log(item.body);
    console.log(result);
    console.log('END -------------------------');

    return result;
});