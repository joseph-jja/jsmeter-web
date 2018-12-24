const fs = require('fs'),
    espree = require('espree'), 
    estraverse = require('estraverse');

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

const functionMap = [];

estraverse.traverse(tree, {
    enter: function (node, parent) {
        if (node.type == 'FunctionExpression') {
            // need to look at parent 
            const left = parent.left;
            if ( left && left.name ) { 
                const feNode = Object.assign({}, { name: left.name }, node);
                functionMap.push(feNode);
            } else if ( left && left.object && left.property && left.object.type && left.property.name ) { 
                let prefix = left.object.type, 
                    name = left.property.name;
                if ( left.object.type === 'ThisExpression' ) {
                    prefix = 'this';
                } else if ( left.object.type === 'CallExpression' ) {
                    const callObject = left.object.callee;
                    prefix = `${callObject.object.name}.${callObject.property.name}`;
                } else if ( left.object.type === 'MemberExpression' ) {
                    const callObject = left.object;
                    prefix = `${callObject.object.name}.${callObject.property.name}`;
                } else {
                console.log('Start FE Parent -------------------------');
                console.log(left);
                console.log('End FE Parent -------------------------');
                } 
                const feNode = Object.assign({}, { name: `${prefix}.${left.property.name}` }, node);
                functionMap.push(feNode);
            } else if ( parent.id && parent.id.name ) { 
                const feNode = Object.assign({}, { name: parent.id.name }, node);
                functionMap.push(feNode);
            } else {
                console.log('Start FE Parent -------------------------');
                console.log(parent);
                console.log('End FE Parent -------------------------');
                functionMap.push(node);
            } 
        } else if (node.type == 'FunctionDeclaration') {
            const feNode = Object.assign({}, { name: node.id.name }, node);
            functionMap.push(feNode);
        }
    },
    leave: function (node, parent) {
        if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration') {
            //console.log('END -------------------------');
        }
    }
});

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
 - Halstead Volume: 15.8     
 - Halstead Potential: 8      
 - Program Level: 0.506      
 - MI Volume: 150.1
*/
functionMap.forEach( item => {
    
    const result = {
        file: file,
        functionName: item.name,
        startLine: item.loc.start.line,
        endLine: item.loc.end.line,
        lines: ( item.loc.end.line - item.loc.start.line)
    }; 
    console.log('BEGIN -------------------------');
    //console.log(item);
    console.log(result);
    console.log('END -------------------------');
});


