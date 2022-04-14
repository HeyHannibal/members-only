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

const mongoDb = process.env.mongoURL;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = require("./models/user");
const Message = require("./models/message");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const app = express();

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
// Set up local strategy
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      console.log(user);
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            // passwords match! log user in
            return done(null, user);
          } else {
            // passwords do not match!
            return done(null, false, { message: "Incorrect password" });
          }
        })
      ) {
        return done, false, { message: "Incorrect password" };
      }
      console.log("done");
      return done(null, user);
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

app.get("/sign-up", (req, res) => res.render("sign-up-form"));
app.get("/log-in", (req, res) => res.render("log-in-form"));
app.get("/show-db", (req, res, next) => {
  User.find({}).exec(function (err, users) {
    if (err) {
      return next(err);
    } else console.log(users);
    res.redirect("./");
  });
});

app.post("/sign-up", (req, res, next) => {
  bcrypt.hash(req.body.password[0], 10, (err, hashedPassword) => {
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
});

app.get("/comment", (req, res) => res.render("comment"));
app.get("/comment/user/:id", (req, res) => {
  if(req.params.id)
  Message.find({'user': req.params.id})
  .sort({date : 1})
  .populate('user')
  .exec(function (err, messages) {
    if (err) {return next(err); }
    console.log(messages)
    res.render('user-messages', { messages: messages, })
  })
  else res.redirect('/')
})
app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);
app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.post("/comment", (req, res, next) => {
  const newComment = new Message({
    title: req.body.title,
    text: req.body.comment, 
    user: req.user.id
  })
  newComment.save((err) => {
    if (err) {return next(err)}
    res.redirect("/")
  })
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
