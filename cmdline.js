	(function () {
		var verbose = false;
		var args = process.argv;
		var fs = require("fs");
		var meter = require("./lib/jsmeter/jsmeter");
                meter = meter['jsmeter'];
		for (var a = 2; a < args.length; a++) {
			if (args[a] === "--verbose") {
				verbose = true;
				continue;
			}
			fs.readFile(args[a], "utf8", (function (name) {
				return function (err, data) {
					if (err) throw err;
					var result = meter.run(data, name.match(/([^\/])\.js$/)[1]);
					for (var i = 0; i < result.length; i++) {
						if (verbose) {
							console.dir(result[i]);
						}
						console.log(" line start: %d", result[i].lineStart);
						console.log(name, result[i].name.replace(/^\[\[[^\]]*\]\]\.?/, ""));
						console.log(" statements: %d", result[i].s);
						console.log(" lines:      %d", result[i].lines);
						console.log(" comments:   %d", result[i].comments);
						console.log(" % comments:   %d", Math.round(result[i].comments / (result[i].lines) * 10000)/100 + "%" );
						console.log(" branches: %d", result[i].b);
						console.log(" depth: %d", result[i].blockDepth);
						console.log(" complexity: %d", result[i].complexity);
						console.log(" Halstead Volume: %d", result[i].halsteadVolume);
						console.log(" Halstead Potential: %d", result[i].halsteadPotential);
						console.log(" Program Level: %d", result[i].halsteadLevel);
						console.log(" MI Volume: %d", result[i].mi);
					}
				};
			})(args[a]));
		}
	})();
