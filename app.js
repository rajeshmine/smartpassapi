var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');	

var indexRouter = require('./routes/index');
var server = require('./routes/server');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function (req, res, next) {
	
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
   
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    next();
	
});

app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', server);

module.exports = app;
