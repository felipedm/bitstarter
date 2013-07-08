#!/usr/bin/env node
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting", instr);
	process.exit(1);
    }
    return instr;
};

var checkUrlFile = function(urlfile, checksfile) {
    rest.get(urlfile).on('complete', function(result) {
	fs.writeFileSync('result.html', result);
	assertFileExists('result.html');
	checkHtmlFile('result.html', checksfile);
    });
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var result =  addToArray(checks);
    var outJson = JSON.stringify(result, null, 4);
    console.log(outJson);
};

var addToArray = function(file) {
    var out = {};
    for(var ii in file){
	var present = $(file[ii]).length > 0;
	out[file[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'path to url', "")
	.parse(process.argv);
    var result;
    if(program.url !== ""){
	result = checkUrlFile(program.url, program.checks);
    } else {
	var result = checkHtmlFile(program.file, program.checks);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
