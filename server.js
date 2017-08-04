const express 		= require('express');
const app			= express();
const mongoose 		= require('mongoose');
const passport 		= require('passport');
const flash			= require('connect-flash');
const morgan		= require('morgan');
const cookieParser	= require('cookie-parser');
const bodyParser	= require('body-parser');
const session		= require('express-session');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/public/views');
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(session({
	secret: 'WDI-GENERAL-ASSEMBLY-EXPRESS',
	cookie: { maxAge: 360000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

var routes = require('./config/routes');
app.use(routes);

app.listen(3000);