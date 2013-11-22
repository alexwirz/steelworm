var express = require("express");
var app = express();
app.use(express.logger());
app.use(express.bodyParser());
var fs = require("fs")

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.post('/', function(request, response) {
	var name = request.body.name;
	response.send('Hello ' + name + '!');
});


app.get('/hello', function(request, response) {
	fs.readFile('./hello.html', function (err, html) {
    if (err) {
			throw err; 
    }
		response.setHeader ("Content-Type", "text/html");
  	response.send(html);
		response.end();
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

