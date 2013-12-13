var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

function send404(res){
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.write('Error 404: resource not found.');
	res.end();
}

function sendFile(res, filePath, fileContents){
	res.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
	res.end(fileContents);
}

function serveStatic(res, absPath){
	fs.exists(absPath, function(exists){
		if(exists){
			fs.readFile(absPath, function(err, data){
				if(err){
					send404(res);
				} else {
					sendFile(res, absPath, data);
				}
			});
		} else {
			send404(res);
		}
	});
}

var server = http.createServer(function(req, res){
	var filePath = false;

	if(req.url == '/'){
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + req.url;
	}

	var absPath = './' + filePath;

	serveStatic(res, absPath);
});

server.listen(8080);

var chatServer = require('./lib/chat_server.js');
chatServer.listen(server);