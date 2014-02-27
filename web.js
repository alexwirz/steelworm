var express = require("express");
var passport = require ("passport");
var GitHubStrategy = require ('passport-github').Strategy;
var app = express();

passport.use(new GitHubStrategy({
    clientID: '139369522cd1d37bb51f',
    clientSecret: '4311d291fda987b489b3b992d3a8727030383c89',
    callbackURL: 'http://steelworm.herokuapp.com/gh-oauth-callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {      
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

function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}

function sessionKey () {
	var sessionKey = randomString (32, 'aA#!');
	console.log ('sessionKey : ' + sessionKey);
	return sessionKey;
}

app.configure(function() {
	app.use (express.cookieParser());
	app.use (express.cookieSession ({secret : sessionKey (), cookie: { maxAge: 60 * 1000 }}));
  	app.use (express.bodyParser());
  	app.use (express.logger ());
	app.use (passport.initialize());
	app.use (app.router);
	app.set("views", __dirname + "/views");
	app.set("view engine", "jade");
});

app.get('/', function(request, response) {
	response.render ('index', {username : request.session.passport.user});
});

app.get('/cookie-test', function (request, response){
	response.send (request.session.passport.user);
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
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
  	console.log ('auth callback: redirecting...')
    console.log ('gh-oauth-callback... user :  ' + req.user);
    res.redirect('/');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

