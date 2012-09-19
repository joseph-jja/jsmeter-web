var express         = require('express');
var fs         = require('fs');

var app = express();

var debug = false;

function readFile(req, res) {
    var filename = req.originalUrl;
    filename = filename.replace(/^\//, '');
    if ( filename === '' ) { 
        filename = "index.html";
    }
    fs.readFile(filename, (function (name) {
        return function (err, data) {
            if (err) { 
                res.status(404);
                console.log(err); return; 
            }
            if ( filename.lastIndexOf(".js") !== -1 ) {
                res.set('Content-Type', 'text/javascript');
            } else if ( filename.lastIndexOf(".css") !== -1 ) {
                res.set('Content-Type', 'text/css');
            } else if ( filename.lastIndexOf(".png") !== -1 ) {
                res.set('Content-Type', 'image/png');
            } else if ( filename.lastIndexOf(".html") !== -1 ) {
                res.set('Content-Type', 'text/html');
            }
            res.send(data);
        }
    })());
}

app.get(/^\/*/, readFile);

function buildResponse(result) { 
    
    var name, row, response = '{ "analysis":[';
    var len = result.length;
    
    if ( debug ) {
        console.log("Result length = " + len);
    }
    
    for (var i = 0; i < len; i++) {
        name = result[i].name.replace(/^\[\[[^\]]*\]\]\.?/, "Anonymous");
        row = ( i % 2 === 0 ) ? "odd": "even";
        response += '{ "rowClass": "' + row + '",';
        response += ' "functionName": "' + name.replace("[[code]].", "") + '",';
        response += '"lineStart":"' + result[i].lineStart + '",';
        response += '"statements":"' + result[i].s + '",';
        response += '"branches":"' + result[i].b + '",';
        response += '"lines":"' + result[i].lines + '",';
        response += '"comments":"' + result[i].comments + '",';
        response += '"commentPercent":"' + Math.round(result[i].comments / (result[i].lines) * 10000)/100 + '",';
        response += '"blockDepth":"' + result[i].blockDepth + '",';
        response += '"complexity":"' + result[i].complexity + '",';
        response += '"halsteadVolume":"' + result[i].halsteadVolume + '",';
        response += '"halsteadPotential":"' + result[i].halsteadPotential + '",';
        response += '"halsteadLevel":"' + result[i].halsteadLevel + '",';
        if ( isNaN(result[i].mi) ) { result[i].mi = 0; }
        response += '"mi":"' + parseFloat(result[i].mi, 10) + '" }';
        if ( i < len - 1 ) { response += ","; }
        
    }
    
    response += "] }";
    if ( debug ) {
      console.log(response);
    }
    return response;
}

app.post('/jsmeter', function(req, res){

    var data, fs = require("fs"), 
        meter = require("jsmeter");
    
    meter = meter['jsmeter'];

    data = "";
    req.on('data', function(chunk) { 
            data += chunk.toString();
            if ( debug ) {
                console.log(data);
            }
    });
    
    req.on('end', function() { 
        
        var result = meter.run(data);
        
        res.set('Content-Type', 'text/html');
        
        var response = buildResponse(result);
        
        res.send(response);        
    });
});

app.listen(12000);
