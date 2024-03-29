if (!Date.prototype.toISOString) {
	Date.prototype.toISOString = function() {
		function pad(n) {
			return n < 10 ? '0' + n : n;
		}

		function ms(n) {
			return n < 10 ? '00' + n : n < 100 ? '0' + n : n
		}

		return this.getFullYear() + '-' + pad(this.getMonth() + 1) + '-' + pad(this.getDate()) + 'T' + pad(this.getHours()) + ':' + pad(this.getMinutes()) + ':' + pad(this.getSeconds()) + '.' + ms(this.getMilliseconds()) + 'Z';
	}
}


function createHAR(address, title, startTime, resources) {
	var entries = [];

	resources.forEach(function(resource) {
		var request = resource.request, startReply = resource.startReply, endReply = resource.endReply;

		if (!request || !startReply || !endReply) {
			return;
		}

		// Exclude Data URI from HAR file because
		// they aren't included in specification
		if (request.url.match(/(^data:image\/.*)/i)) {
			return;
		}

		entries.push({
			startedDateTime : request.time.toISOString(),
			time : endReply.time - request.time,
			request : {
				method : request.method,
				url : request.url,
				httpVersion : "HTTP/1.1",
				cookies : [],
				headers : request.headers,
				queryString : [],
				headersSize : -1,
				bodySize : -1
			},
			response : {
				status : endReply.status,
				statusText : endReply.statusText,
				httpVersion : "HTTP/1.1",
				cookies : [],
				headers : endReply.headers,
				redirectURL : "",
				headersSize : -1,
				bodySize : startReply.bodySize,
				content : {
					size : startReply.bodySize,
					mimeType : endReply.contentType
				}
			},
			cache : {},
			timings : {
				blocked : 0,
				dns : -1,
				connect : -1,
				send : 0,
				wait : startReply.time - request.time,
				receive : endReply.time - startReply.time,
				ssl : -1
			},
			pageref : address
		});
	});

	return {
		log : {
			version : '1.2',
			creator : {
				name : "PhantomJS",
				version : phantom.version.major + '.' + phantom.version.minor + '.' + phantom.version.patch
			},
			pages : [{
				startedDateTime : startTime.toISOString(),
				id : address,
				title : title,
				pageTimings : {
					onLoad : page.endTime - page.startTime
				}
			}],
			entries : entries
		}
	};
}

var page = require('webpage').create(),
    system = require('system');
var fs = require('fs');
page.settings.userAgent = "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19";

var delay = 5;
var output;
switch(system.args.length){
	case 1:
		console.log('Usage: netsniff.js <some URL> <delay>');
	    phantom.exit(1);
	break;
	case 2:
		page.address = system.args[1];
	break;
	case 3:
		page.address = system.args[1];
		delay = system.args[2];
	break;
	case 4:
		page.address = system.args[1];
		delay = system.args[2];
		output = system.args[3];
	break;
}

page.resources = [];

page.onLoadStarted = function () {
    page.startTime = new Date();
};

page.onResourceRequested = function (req) {
    page.resources[req.id] = {
        request: req,
        startReply: null,
        endReply: null
    };
};

page.onResourceReceived = function (res) {
    if (res.stage === 'start') {
        page.resources[res.id].startReply = res;
    }
    if (res.stage === 'end') {
        page.resources[res.id].endReply = res;
    }
};


page.open(page.address,function (status) {
    var har;
    if (status !== 'success') {
        console.log('FAIL to load the address');
        phantom.exit(1);
    } else {
        page.endTime = new Date();
        page.title = page.evaluate(function () {
            return document.title;
        });
        setTimeout(function(){
        	har = createHAR(page.address, page.title, page.startTime, page.resources);
        	var result = JSON.stringify(har, undefined, 4);
        	if(output){
        		fs.write(output,result,'w');
        	}else{
        		console.log(result);
        	}
            phantom.exit();
        },delay*1000);
       
    }
});



