var __config = require("./config.js");

var __fs = require("fs");

var template = {
	"head" : __fs.readFileSync(__config.template['head'], {
		encoding : "utf8"
	}),
	"body" : __fs.readFileSync(__config.template['body'], {
		encoding : "utf8"
	}),
	"foot" : __fs.readFileSync(__config.template['foot'], {
		encoding : "utf8"
	})
}




var __jsdom = require("jsdom");

module.exports = function(htmlFile) {
	var content = __fs.readFileSync(htmlFile,{
		encoding:"utf8"
	});
	
	content = content.replace(/(\<head.*\>)/,"$1"+template['head']);
	
	content = content.replace(/(\<body.*\>)/,"$1"+template['body']);
	
	content = content.replace(/(\<\/body.*\>)/,template['foot']+"$1");
	
	__fs.writeFileSync(htmlFile,content);
	/*
	__jsdom.env({
			file : htmlFile,
			scripts : ["http://code.jquery.com/jquery.js"],
			done : function(errors, window) {
				var $ = window.$;
				debugger;
	
				var document = window.document;
	
				$("head").prepend(template.head);
	
				$("body").prepend(template.body);
	
				$("body").append(template.foot);
	
				$(".jsdom").remove();
	
				var htmlContent = document.doctype + "\n" + document.documentElement.outerHTML;
	
				__fs.writeFileSync(htmlFile,htmlContent);
	
				callback && callback();
	
			}
		});*/
	

}
