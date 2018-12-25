const fs = require('fs'),
    espree = require('espree'),
    estraverse = require('estraverse');

const parser = require('./lib/baseParser');

const file = process.argv[2];

const data = fs.readFileSync(file);

const {
    comments,
    functionMap
} = parser.parse(data);

// map the comments to the functions based on lines
function mapComments(start, end) {

    return comments.filter(x => {
        const linestart = x.loc.start.line,
            lineend = x.loc.end.line;
        return (linestart >= start && lineend <= end);
    }).length;
}

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

    let returns = 1,
        branches = 0;

    estraverse.traverse(item, {
        enter: function(node, parent) {
            if (node.type === 'ReturnStatement') {
                returns++;
            } else if (node.type === 'IfStatement') {
                branches++;
                if ( node.alternate && node.alternate.type === 'BlockStatement') {
                    branches++;
                }
            } else if (node.type === 'ForStatement') {
                branches++;
            } else {
                //console.log(node.type); 
            }
        },
        leave: function(node, parent) {}
    });

    result.returns = returns;
    result.branches = branches;
    result.comments = mapComments(result.startLine, result.endLine);

    console.log('BEGIN -------------------------');
    //console.log(item.body);
    console.log(result);
    console.log('END -------------------------');

    return result;
});