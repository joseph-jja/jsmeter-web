const espree = require('espree'),
    estraverse = require('estraverse');

const parserOptions = {
    ecmaVersion: 8,
    range: true,
    loc: true,
    comment: true,
    tokens: false,
    sourceType: "module"
};

function parse(data) {
    const tree = espree.parse(data, parserOptions);

    const functionMap = [];

    estraverse.traverse(tree, {
        enter: function(node, parent) {
            if (node.type == 'FunctionExpression') {
                // need to look at parent 
                const left = parent.left;
                if (left && left.name) {
                    const feNode = Object.assign({}, {
                        name: left.name
                    }, node);
                    functionMap.push(feNode);
                } else if (left && left.object && left.property && left.object.type && left.property.name) {
                    let prefix = left.object.type,
                        name = left.property.name;
                    if (left.object.type === 'ThisExpression') {
                        prefix = 'this';
                    } else if (left.object.type === 'CallExpression') {
                        const callObject = left.object.callee;
                        prefix = `${callObject.object.name}.${callObject.property.name}`;
                    } else if (left.object.type === 'MemberExpression') {
                        const callObject = left.object;
                        prefix = `${callObject.object.name}.${callObject.property.name}`;
                    } else {
                        console.log('Start FE Parent -------------------------');
                        console.log(left);
                        console.log('End FE Parent -------------------------');
                    }
                    const feNode = Object.assign({}, {
                        name: `${prefix}.${left.property.name}`
                    }, node);
                    functionMap.push(feNode);
                } else if (parent.id && parent.id.name) {
                    const feNode = Object.assign({}, {
                        name: parent.id.name
                    }, node);
                    functionMap.push(feNode);
                } else {
                    console.log('Start FE Parent -------------------------');
                    console.log(parent);
                    console.log('End FE Parent -------------------------');
                    functionMap.push(node);
                }
            } else if (node.type == 'FunctionDeclaration') {
                const feNode = Object.assign({}, {
                    name: node.id.name
                }, node);
                functionMap.push(feNode);
            }
        },
        leave: function(node, parent) {
            if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration') {
                //console.log('END -------------------------');
            }
        }
    });

    return {
        comments: tree.comments,
        functionMap
    };
}

module.exports = {
    parse
};