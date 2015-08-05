var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./libraries/config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use('/core.js', require('./middlewares/core')(app.get('env')));

app.use(function (req, res, next) {// TODO : remove code below
    if (req.query.XDEBUG_SESSION_START) {
        config.set('XDEBUG_SESSION_START', req.query.XDEBUG_SESSION_START);
    }
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('less-middleware')('/less', {
    force: true,
    once: true,
    pathRoot: path.join(__dirname, 'public'),
    dest: '/css'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(require('./middlewares/debug')(app.get('env')));

app.use(require('./controllers/_router'));

var errorController = require('./controllers/error')(app.get('env'));
app.use(errorController.error404);
app.use(errorController.error500);


module.exports = app;
