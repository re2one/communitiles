const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const auth = require('./models/authenticationModel');
const cors = require('cors');

const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const onlineRouter = require('./routes/online');
const pairingRouter = require('./routes/pairing');
const guessingRouter = require('./routes/guessing');
const recommendingRouter = require('./routes/recommending');
const imageRouter = require('./routes/images');
const commonRouter = require('./routes/common');
const scoreRouter = require('./routes/score');

const app = express();

let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.all('/secure/*', auth.checkIfAuthenticated);
app.all('/secure/game/*', async (req, res, next) => {
    let checkRole = await auth.checkRole(req)
    if(!checkRole){
      res.status(401).json({msg: 'not authorized'});
    } else {
      next();
    }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/secure/online', onlineRouter);
app.use('/secure/pairing', pairingRouter);
app.use('/secure/score', scoreRouter);
app.use('/secure/game/guessing', guessingRouter);
app.use('/secure/game/recommending', recommendingRouter);
app.use('/secure/game/images', imageRouter);
app.use('/secure/game/common', commonRouter);

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
