var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var db = require('monk')('mongodb://<dbuser>:<dbpassword>@<server>:<port>/<database>');
var multer = require('multer');
var flash = require('connect-flash');

var routes = require('./routes/index');
var posts = require('./routes/posts');
var categories = require('./routes/categories');
var author = require('./routes/author');

var app = express();

app.locals.moment = require('moment');

app.locals.truncateText = function(text, length){
  if (text)
      var truncateText = text.substring(0, length);
  else
      var truncateText = text;
  return truncateText;
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
// Handle 404
/*app.use(function(req, res) {
    res.status('404').send('Page not Found');
});

// Handle 500
app.use(function(error, req, res, next) {
    res.status('500').send('Internal Server Error');
});*/
app.set('view engine', 'jade');


// Handle file Uploads
app.use(multer({ dest: './public/images/uploads/',
  rename: function (fieldname, filename) {
    return filename+Date.now();
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
    done=true;
  }
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handle Express-Session
app.use(session({
  secret:'secret',
  resave:true,
  saveUninitialized:true
}));


// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while (namespace.length){
      formParam += '['+ namespace.shift() +']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// make db accessible to our router
app.use(function(req, res, next) {
  req.db = db;
  next();
})


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use('/', routes);
app.use('/posts', posts);
app.use('/categories', categories);
app.use('/author', author);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
/*/ Handle 404
app.use(function(req, res) {
    res.status(400);
    res.render('404', {title: '404: File Not Found'});
});

// Handle 500
app.use(function(error, req, res, next) {
    res.status(500);
    res.render('500', {title:'500: Internal Server Error', error: error});
});*/

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
