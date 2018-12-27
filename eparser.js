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
        functionName: item.name || '(Anonymous1)',
        startLine: item.loc.start.line,
        endLine: item.loc.end.line,
        lines: (item.loc.end.line - item.loc.start.line)
    };

    let returns = 1,
        statements = 0,
        branches = 0;

    if (item.type === 'FunctionExpression') {
        statements++;
    }

    function processNodeEnter(node, parent) {
        if (node.type.indexOf('ExpressionStatement') > -1) {
            statements++;
        } else if (node.type.indexOf('BlockStatement') > -1) {
            statements++;
        } else if (node.type.indexOf('BinaryExpression') > -1) {
            statements++;
        } else if (node.type.indexOf('CallExpression') > -1) {
            statements++;
        } else if (node.type.indexOf('VariableDeclaration') > -1 &&
            node.declarations) {
            node.declarations.forEach(i => {
                if (i.init) {
                    statements++;
                    //console.log('begin');
                    //console.log(i);
                    //console.log('end');
                }
            });
        }

        if (node.type === 'ReturnStatement') {
            returns++;
        } else if (node.type === 'IfStatement') {
            branches++;
            if (node.alternate && node.alternate.type === 'BlockStatement') {
                branches++;
            }
        } else if (node.type === 'ForStatement' ||
            node.type === 'DoWhileStatement' ||
            node.type === 'WhileStatement') {

            branches++;
        } else {
            //console.log(node.type);
        }
        /*if (node.body && Array.isArray(node.body)) {
             node.body.forEach(i => {
                //processNodeEnter(i);
                    console.log('---begin');
                    console.log(i);
                    console.log('---end');
            });
        }*/
    }

    estraverse.traverse(item, {
        enter: processNodeEnter,
        leave: function(node, parent) {}
    });

    result.statements = statements;
    result.returns = returns;
    result.branches = branches;
    result.comments = mapComments(result.startLine, result.endLine);

    console.log('BEGIN -------------------------');
    console.log(item.type);
    console.log(result);
    console.log('END -------------------------');

    return result;
});
