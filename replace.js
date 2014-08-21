var __fs = require('fs');

var filelist = [];


function findFile(folder){
	__fs.readdirSync(folder).forEach(function(f){
		f = folder+"/"+f;
		if(__fs.lstatSync(f).isDirectory()){
			findFile(f);
		}else{
			if(/\.js|css|html$/.test(f)){
				filelist.push(f);	
			}
			
		}
	});
}




function replaceJavascript(content){
	
	
	content = content.replace(/eval(\(.*\))/g,function(a,b,c,d){
		
		try{
			return eval(b);
		}catch(e){
			return a;	
		}
		
		
	});
	
	return content;
}

function replaceUnicode(content){
	content = content.replace(/\\x([0-9]+)/g,function(a,b){
		
		return String.fromCharCode(parseInt(b, 16));
	});
	return content;
}

function replaceResourcePath(content, diffList){
	diffList.forEach(function(diff){
		content = content.replace(new RegExp("[a-zA-Z|\/|\.|\:|0-9]+"+diff['filename'].replace(/\./g,"\\."),"g"),diff['replace']);
	});
	return content;
}


module.exports = function(output, diffList){
	
	
	findFile(output);
	
	filelist.forEach(function(file){
		var content = __fs.readFileSync(file,{
			encoding:"utf8"
		});
		if(/\.js$/.test(file)){
			content = replaceJavascript(content);
		}
		
		content = replaceResourcePath(content,diffList);
		
		// content = replaceUnicode(content);
		
		__fs.writeFileSync(file,content);
	
	});
}



function test(){
	var content =  __fs.readFileSync("E:/endgames/spider/generator/output/1408537701982/js/game.min.js",{
		encoding:"utf8"
	});
	
	console.info(replaceJavascript(content));
	
}

// test();




