const url = require('url'); 
const express = require("express");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
var exphbs  = require('express-handlebars');
const passportConfig = require("./passport-config");
const path = require("path");

const port = process.env.PORT || 4000;

const users = [{ email: "a@m.com", password: "p", id: 1 }];

passportConfig(passport, users);

const server = express();

server.use(express.static("public"));

server.engine('hbs', exphbs());
server.set('view engine', 'hbs');

server.use(flash());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(
  session({
    secret: "keyboard cat",
    saveUninitialized: false,
    resave: false
  })
);

server.use(passport.initialize());
server.use(passport.session());

const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  return next();
};

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return next();
};

server.get("/", isAuthenticated, (req, res) => {
  res.render("index", { user: true });
});

server.post(
  "/login",
  isLoggedIn,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: true
  })
);

server.get("/login", isLoggedIn, (req, res) => {
  const { message } = req.query;
  res.render("login", { message });
});

server.get("/logout", isAuthenticated, (req, res) => {
  const urlPath = url.format({
    pathname:"/login",
    query: {
       message: 'You are logged out successfully!',
     }
  });
  req.logOut();
  res.redirect(urlPath);
});

server.get("/sign-up", isLoggedIn, (req, res) => {
  res.render("sign-up");
});

server.listen(port, console.log(`Server is running on ${port}`));
