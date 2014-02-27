var express = require("express");
var passport = require ("passport");
var GitHubStrategy = require ('passport-github').Strategy;
var app = express();

passport.use(new GitHubStrategy({
    clientID: process.env.GH_CLIENT_ID,
    clientSecret: process.env.GH_CLIENT_SECRET,
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

app.configure(function() {
	app.use (express.cookieParser());
	var sessionSecret = require ('./sessionSecret');
	app.use (express.cookieSession ({secret : sessionSecret.newSessionSecret (), cookie: { maxAge: 60 * 1000 }}));
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

