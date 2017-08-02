const express 		= require('express');
const app			= express();
const mongoose 		= require('mongoose');
const passport 		= require('passport');
const flash			= require('connect-flash');
const morgan		= require('morgan');
const cookieParser	= require('cookie-parser');
const bodyParser	= require('body-parser');
const session		= require('express-session');

mongoose.connect('mongod://localhost/transplaces');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.use(express.static(__dirname + '/public'));

app.set('views', './views');
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(session({secret: 'Corey-doesnt-know-what-this-does'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);

var routes = require('./config/routes');
app.use(routes);

app.listen(3000);