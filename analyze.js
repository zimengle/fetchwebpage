var __fs = require('fs');
var __request = require("request").defaults({
	jar : true
});

var mkdirp = require('mkdirp');

var diffList = [];

function getFilePath(contentType,url){

	var filename = url.substring(url.lastIndexOf("/")+1);
	if(filename==""){
		filename = "index.html";
	}
	var suffix = filename.substring(filename.lastIndexOf("."));
	
	var filepath = ({
		".json":"data/",
		".plist":"data/",
		".mp3":"mp3/",
		".js":"js/",
		".css":"",
		".html":"",
		".png":"images/",
		".jpg":"images/",
		".jpeg":"images/",
		".gif":"images/",
		".swf":"swf/"
	})[suffix];
	if(typeof filepath != "undefined"){
		diffList.push({
			"filename":filename,
			"replace":filepath+filename
		});
	}
	
	
	return "/"+filepath+filename;
}

module.exports = function(har, output,callback) {
	var index = 0;
	var fetchUrl = har['log']['entries'][0]['request']['url'];
	var urlPath = fetchUrl.substring(0,fetchUrl.lastIndexOf("/"));
	
	var entries = har['log']['entries'];
	entries.forEach(function(entry) {
		
		var request = entry['request'];
		var response = entry['response'];
		var headers = {};
		var url = request.url.replace(/\?.*/g, "");
		var contentType = response['content']['mimeType'];
		var filepath;
		/*
		if(url.indexOf(urlPath) !== -1){
					filepath = url.replace(urlPath, "");
					
				}else{*/
		
			filepath = getFilePath(contentType,url);
		//}
		if(filepath == "/" && contentType =="text/html"){
			filepath = "/index.html"
		}
		
		var outpath = output + filepath;
		console.info(outpath);
		mkdirp.sync(outpath.substring(0, outpath.lastIndexOf("/")));
		request.headers.forEach(function(h) {
			if (['Last-Modified', 'ETag', 'Expires', 'Cache-Control'].indexOf(h['name']) !== -1) {
				headers[h['name']] = h['value'];
			}

		});
		/*
		if(response['content']['text']){
					
					__fs.writeFileSync(outpath,response['content']['text']);
					checkDone();
				}else{*/
		
			__request({
				url : url,
				headers : headers
			}, function() {
				checkDone();
			}).pipe(__fs.createWriteStream(outpath));

		//}
		
	});

	function checkDone() {
		index++;
		if (index == entries.length) {
			callback(diffList);
		}

	}

	

}

