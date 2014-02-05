var app = require('http').createServer(handler),
	fs = require('fs'),
	io = require('socket.io').listen(app);

app.listen(8080);

function handler (req, res) {
	fs.readFile(__dirname + req['url'],
	function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading ' + req['url']);
		}

		res.writeHead(200);
		res.end(data);
	});
}

io.configure(function() {
	// Restrict log output
	io.set("log level", 2);
});


io.sockets.on('connection', function (socket) {
	//socket.on
	//socket.emit
	socket.on('get docs', function() {

	})
});

