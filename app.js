const createError = require("http-errors");
const express = require("express");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const mongoDb = process.env.mongoURL;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = require("./models/user");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const actionsRouter = require("./routes/actions");
const app = express();

// passport
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/action", actionsRouter);

// Set up local strategy
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        console.log('no user')
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          console.log('match')
          // passwords match! log user in
          return done(null, user)
        } else {
          console.log('no')
          console.log(password, user.password)
          return done(null, false, { message: "Incorrect password" })
        }
      })
    });
  })
);


passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

/// Signup
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post(
  "/sign-up",
  [
    body("username").trim().isLength({ min: 5 }).withMessage("Must be at least 5 characters").escape(),
    body("password").trim().isLength({ min: 5 }).withMessage("Must be at least 5 characters").escape(),
    body("confirmpassword").trim().isLength({ min: 5 }).withMessage("Must be at least 5 characters").custom((value, { req }) => value === req.body.password).withMessage("passwords must match").escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error_list = {};
      errors.errors.forEach((error) => (error_list[error.param] = error));
      return res.render("sign-up-form", {
        username: req.body.username,
        errors: error_list,
      });
    } else
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
        }).save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/");
        });
      });
  }
);

// Login
app.get("/login", (req, res) =>{
  let userNotFound = req.session.messages ? req.session.messages[req.session.messages.length -1 ] : [];
  console.log(userNotFound)
  res.render("login-form", {userNotFound: userNotFound})
  });

app.post(
  "/login",
  [
    body("username").trim().isLength({ min: 5 }).withMessage("Must be at least 5 characters").escape(),
    body("password").trim().isLength({ min: 5 }).withMessage("Must be at least 5 characters").escape(),
  ], 
  (req, res, next) => {
      const errors = validationResult(req); 
      console.log(errors)
      if(!errors.isEmpty()) {
        const error_list = {};
        errors.errors.forEach((error) => (error_list[error.param] = error));
        res.render('login-form', {
          username: req.body.username,
          errors: error_list,
        })
      }
      else next()
  },
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  }), 

);

app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
