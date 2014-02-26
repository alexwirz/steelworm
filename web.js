var express = require("express");
var passport = require ("passport");
var GitHubStrategy = require ('passport-github').Strategy;
var app = express();
var fs = require("fs");
var geoip = require('geoip');

passport.use(new GitHubStrategy({
    clientID: '139369522cd1d37bb51f',
    clientSecret: '4311d291fda987b489b3b992d3a8727030383c89',
    callbackURL: 'http://steelworm.herokuapp.com/gh-oauth-callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      console.log ('welcome ' + profile.username + '!');
      return done(null, profile.username);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.configure(function() {
	app.use (express.cookieParser());
	app.use (express.cookieSession ({secret : 'V3ryS3cr3tSh!t!'}));
  	app.use (express.bodyParser());
  	app.use (express.logger ());
	app.use (passport.initialize());
	app.use (app.router);
});

app.get('/', function(request, response) {
	//var name = request.user;
	console.log ('/ request.user : ' + request.user);
	console.log ('isAuthenticated: ' + request.isAuthenticated ());
  response.send ('Welcome ...!');
  response.send ('isAuthenticated: ' + request.isAuthenticated ());
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

//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
app.get('/gh-oauth',
  passport.authenticate('github'),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
});

//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/gh-oauth-callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
  	console.log ('auth callback: redirecting...')
 	console.log ('isAuthenticated: ' + req.isAuthenticated ());
    console.log ('user :  ' + req.user);
    res.redirect('/');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

