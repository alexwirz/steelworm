var express = require("express");
var app = express();
app.use(express.logger());
app.use(express.bodyParser());
var fs = require("fs")
var geoip = require('geoip');

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.post('/', function(request, response) {
	var name = request.body.name;
	response.send('Hello ' + name + '!');
});

app.get('/ip', function(request, response) {
	//var ip = request.connection.remoteAddress;
	var ip = request.headers["x-forwarded-for"];
	if (ip){
		var list = ipAddr.split(",");
		ip = list[list.length-1];
	} else {
		ip = request.connection.remoteAddress;
	}

	var city = new geoip.City('GeoLiteCity.dat');
	var clientCity = city.lookupSync (ip);
	console.log(clientCity);
	if (clientCity == null) {
		response.send ('Could not figure out your location :( Your ip is ' + ip);
	} else {
        	response.send('Your ip is ' + ip + '. You are in ' + clientCity.country_name + '/' + clientCity.city);
	}
    }
);

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

