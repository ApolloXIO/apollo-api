// ===========
// BASIC SETUP
// ==========

var express  = require('express');
var app 	 = express();
var port     = process.env.PORT || 8080;

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var path 		 = require('path');

var mongoose = require('mongoose');
var passport = require('passport');

mongoose.connect('mongodb://127.0.0.1/apollo');

var APIRouter = require('./app/routes/APIRouter');


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// view engine setup
app.set('view engine', 'jade');

// ======
// ROUTES
// ======

app.use('/api/v1/', APIRouter);

app.get('/', function (req, res) {
	res.send("Hello World!");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// ===================
// Run The Express App
// ===================
app.listen(port);
console.log('The Hacking Begins at port ' + port);
