const url = require('url'); 
const path = require("path");
const express = require("express");
const passport = require("passport");
const flash = require("express-flash");
const bodyParser = require("body-parser");
const session = require("express-session");
const exphbs  = require('express-handlebars');
const passportConfig = require("./passport-config");

const port = process.env.PORT || 4000;

const users = [{ email: "a@m.com", password: "p", id: Date.now().toString() }];

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

server.get("/login", isLoggedIn, (req, res) => {
  const { message } = req.query;
  res.render("login", { message });
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

server.get("/sign-up", isLoggedIn, (req, res) => {
  res.render("sign-up");
});

server.post("/sign-up", isLoggedIn, (req, res) => {
  const { password, email } = req.body;
  if (password && email) {
    users.push({ password, email, id: Date.now().toString() })
    res.redirect('/login');
  } else {
    res.redirect('/sign-up')
  }
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

server.listen(port, console.log(`Server is running on ${port}`));
