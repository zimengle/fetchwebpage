var args = {
	url : "",
	har : "",
	delay : 5,
	output : "./output/" + new Date().getTime()
}
process.argv.forEach(function(val, index, array) {
	var pair = val.split("=");
	if (pair.length == 2) {
		args[pair[0]] = pair[1];
	}
});

var __analyze = require("./analyze.js");
var __fs = require('fs');
var __replace = require('./replace.js');
if (args.har != null) {
	analyze(__fs.readFileSync(args.har, {
		"encoding" : "utf8"
	}));
} else {
	var exec = require('child_process').exec;
	exec('phantomjs ./lib/netsniff.js ' + args.url + ' ' + args.delay, function(error, stdout, stderr) {
		analyze(stdout);
	});
}

function removeItem(arr, item) {
	var i;
	while (( i = arr.indexOf(item)) !== -1) {
		arr.splice(i, 1);
	}
}

function end() {
	var __exec = require('child_process').exec;
	var __open = require("open");

	__exec("http-server " + args.output + " -c-1 -i -p 8887");
	setTimeout(function() {
		__open("http://127.0.0.1:8887");
	}, 1000);

}

var _har;

function analyze(har) {
	har = JSON.parse(har);
	_har = har;
	var entries = har['log']['entries'];
	entries.forEach(function(entry) {
		if (entry['response']['status'] == "301") {
			removeItem(entries, entry);
		}
	});
	__analyze(har, args.output, replace);
}

function replace(diffList) {
	__replace(args.output, diffList);
	build();
}

function build() {
	var __build = require("./build.js");
	__build(args.output + "/index.html");
	end();

}

