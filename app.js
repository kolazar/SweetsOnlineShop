var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var itemRouter = require('./routes/itemsRouter');
var promoRouter = require('./routes/promoRouter');
var favoriteRouter = require('./routes/favoriteRouter');

const mongoose = require('mongoose');

const connect = mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }); 

connect.then((db)=>{
  console.log('Connected correctly to the server');
  },(err)=>{console.log(err); });

var app = express();

app.all('*', (req,res,next)=>{
  if (req.secure){
    return next();
  } else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(session({
  secret: config.secretKey,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection}),
  cookie: {maxAge:180*60*1000},
}));
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/items', itemRouter);
app.use('/promotions', promoRouter);
app.use('/favorites', favoriteRouter);

app.use(function(req,res,next){
  res.locals.session = req.session;
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
