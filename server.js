var express = require('express');
var app = express();

var auto = require('./app');
var async = require('async');

app.get('/', function(req, res){
  res.sendfile("public/index.html");
});

var server = app.listen(process.env.PORT, function() {
    console.log('Listening on port %d', server.address().port);
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('seed', function (data) {
	  var start = function(callback) {
			socket.emit('feed', { text: l.mergeHistory() });
			l.getNext(callback);
		};

		var again = function(err, callback) {
			socket.emit('feed', { text: l.mergeHistory() });
			l.getNext(callback);
		};


	  console.log(data);
	  l = new auto.Query(data.seed);
	  l.complete(function() {
	  	socket.emit('feed', { text: l.mergeHistory() });

	  	todo = [start];
			for (var x=0; x < 100; x++) {todo.push(again);}

			async.waterfall(todo, function(err, result) {
				console.log("done!");
			});
	  });
  });
});