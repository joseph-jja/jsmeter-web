var express         = require('express'),
    fs         = require('fs'), 
    app = express(), 
    debug = true, 
    baseDir = process.cwd(),
    setContentType,
    log, level = {};

level.L0 = "error";
level.L1 = "warn";
level.L2 = "info";
level.L3 = "debug";

log = function(msg, type) { 
    
    if ( debug || type === level.L0 ) { 
        console.log(msg);
    }
};

setContentType = function(filename, res) {
    
    if ( filename.lastIndexOf(".js") !== -1 ) {
        res.set('Content-Type', 'text/javascript');
    } else if ( filename.lastIndexOf(".css") !== -1 ) {
        res.set('Content-Type', 'text/css');
    } else if ( filename.lastIndexOf(".png") !== -1 ) {
        res.set('Content-Type', 'image/png');
    } else if ( filename.lastIndexOf(".html") !== -1 ) {
        res.set('Content-Type', 'text/html');
    } else {
        res.set('Content-Type', 'text/html');
    }
};

function readFile(req, res) {
    var filename = req.originalUrl;
    if ( ! filename ) {
        filename = "index.html";
    }
    filename = filename.replace(/^\//, '');
    if ( filename === '' ) { 
        filename = "index.html";
    }
    fs.readFile(filename, (function (name) {
        return function (err, data) {
            if (err) { 
                res.status(500);
                log(err, level.L0); return; 
            }
            log("Filename is " + filename); 
            setContentType(filename, res);
            res.send(data);
        }
    })());
}

app.get(/^\/*/, readFile);

function buildResponse(result) { 
    
    var name, row, response = '{ "analysis":[', len, i, lines;
    
    len = ( ( result ) ? result.length : 0 );
    
    log("Result length = " + len);
    
    for (i = 0; i < len; i++) {
		if ( result[i] ) {
			name = ( result[i].name ) ? result[i].name.replace(/^\[\[[^\]]*\]\]\.?/, "Anonymous") : "";
			row = ( i % 2 === 0 ) ? "odd": "even";
			response += '{ "rowClass": "' + row + '",';
			response += ' "functionName": "' + name.replace("[[code]].", "") + '",';
			response += '"lineStart":"' + result[i].lineStart + '",';
			response += '"statements":"' + result[i].s + '",';
			response += '"branches":"' + result[i].b + '",';
			response += '"lines":"' + result[i].lines + '",';
			response += '"comments":"' + result[i].comments + '",';
			lines = ( ( result[i].lines !==  0 ) ? result[i].lines : 1 );
			response += '"commentPercent":"' + Math.round(result[i].comments / result[i].lines * 10000)/100 + '",';
			response += '"blockDepth":"' + result[i].blockDepth + '",';
			response += '"complexity":"' + result[i].complexity + '",';
			response += '"complex":"' + (( row['complexity'] > 10 ) ? "exceeded": "") + '",';
			response += '"halsteadVolume":"' + result[i].halsteadVolume + '",';
			response += '"halsteadPotential":"' + result[i].halsteadPotential + '",';
			response += '"halsteadLevel":"' + result[i].halsteadLevel + '",';
			if ( isNaN(result[i].mi) ) { result[i].mi = 0; }
			response += '"miComplex":"' + (( parseFloat(result[i].mi, 10) < 100 ) ? "exceeded": "") + '",';
			response += '"mi":"' + parseFloat(result[i].mi, 10) + '" }';
			if ( i < len - 1 ) { response += ","; }
		}  
    }
    
    response += "] }";
    log(response);
    return response;
}

app.post('/jsmeter', function(req, res){

    var data, fs = require("fs"), 
        meter = require(baseDir + "lib/jsmeter/jsmeter");
    
    meter = meter['jsmeter'];

    data = "";

    req.on('data', function(chunk) { 
            data += chunk.toString();
            //    log("Got: " + data);
    });
    
    req.on('end', function() { 
        var result, response;
        //if ( debug ) { log("Data complete is " + data); }
        try {  
            log("Before meter run.");
            data = data.replace(/\n/, '').replace(/\r/, ''); 
            result = meter.run( data );
            log("After meter run.");
        } catch (e) {
            log("Error: " + e, level.L0);
        }
        
        res.set('Content-Type', 'text/html');
        
        response = buildResponse(result);
        
        res.send(response);        
    });
});

log("listening on localhost port 12000.");
app.listen(12000);

