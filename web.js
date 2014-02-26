var express = require("express");
var app = express();
app.use(express.logger());
app.use(express.bodyParser());
var fs = require("fs")
var geoip = require('geoip');

app.get('/', function(request, response) {
  response.send('Selber Hello!');
});

app.post('/', function(request, response) {
	var name = request.body.name;
	response.send('Hello ' + name + '!');
});

app.get('/ip', function(request, response) {
	//var ip = request.connection.remoteAddress;
	var ip = request.headers["x-forwarded-for"];
	if (ip){
		var list = ip.split(",");
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

app.get('/login', function(request, response) {
	// 90-er! ;)
	fs.readFile('./login-with-github.html', function (err, html) {
		if (err) {
			throw err;
		}

		response.setHeader ("Content-Type", "text/html");
		response.send (html);
		response.end ();
	});
});

app.get ('/gh-oauth', function (request, response){
	var idpGithub = require('idp-github')(
		{ clientId: '139369522cd1d37bb51f',
		clientSecret: '4311d291fda987b489b3b992d3a8727030383c89',
		redirectUri: 'http://steelworm.herokuapp.com/gh-login' });

	// Get the auth URL to redirect the user for OAuth2 login
	var code = idpGithub.authUrl({ state: 'super important stuff' });
	console.log ('code : ' + code);

	// Using the code provided in the query string upon return to your web app, get the identity:
	idpGithub.identity(code, function (err, identity) {
		if (err) {
			console.error('login with github failed!');
			console.log ('err: ' + JSON.stringify(err));
			throw err;
		} else {
			response.send ('Hello, ' + identity.name);
		}
	});
});

app.get ('/gh-login', function (request, response) {
	response.write ('gh-login called...');
	response.write ('request : ' + JSON.stringify(request.body));
	response.end ();
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

