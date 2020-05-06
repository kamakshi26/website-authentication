//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
const md5 = require("md5");
const session = require('express-session');
const passport=require('passport');
const passportlocalmongoose=require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//session
app.use(session({
  secret: 'i ll never love anyone',
  resave: false,
  saveUninitialized: false
}));
//passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
}); //database url connect
mongoose.set('useCreateIndex', true);//to avoid deprecated warning

// create user schema
const userSchema = new mongoose.Schema({
  email: String,//username
  password: String,
  googleId: String,
  secret : String
});

userSchema.plugin(passportlocalmongoose);
userSchema.plugin(findOrCreate);
// create usermodel
const userModel = mongoose.model("user", userSchema);

passport.use(userModel.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  userModel.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secret",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo" //for google+ deprecation..getting user info
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    userModel.findOrCreate({ googleId: profile.id }, function (err, user) { //save the data that the user do in our website in the form of cookie
      return cb(err, user);
    });
  }
));



app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/secret',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secret');
  });

app.get('/', function(req, res) {
  res.render("home");
});


app.get('/login', function(req, res) {
  res.render("login");
});


app.get('/register', function(req, res) {
  res.render("register");
});

app.get('/secret',function(req,res){
userModel.find({secret : {$ne : null}}, function(err,foundusers){
  if(err){
    console.log(err);
  }else{
    if(foundusers){
      console.log(foundusers);
      res.render('secret',{userswithsecrets: foundusers});
    }
  }
});
});

app.post('/register', function(req, res) {
userModel.register({username : req.body.username}, req.body.password, function(err,user){
  if(err){
    console.log(err);
    res.send('<h1>seems like you are already registered! try a new user name or else go to login page! thank you:)</h1>');
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect('/secret');
    })
  }
});

});

app.get('/submit',function(req,res){
  if(req.isAuthenticated()){
    res.render('submit');
  }else{
    res.redirect('/login');
  }
});
app.post('/submit',function(req,res){
  const submittedsecret=req.body.secret;
userModel.findById(req.user.id,function(err,found){
  if(err){
    console.log(err);
  }else{
    if(found){
      found.secret=submittedsecret;
      found.save(function(err){
        res.redirect('/secret');
      });
    }
  }
});
});
app.get('/logout',function(req,res){
  req.logout();
  res.redirect('/');
});

app.post('/login', function(req, res) {
const user=new userModel({
  username : req.body.username,
  password : req.body.password
});

req.login(user,function(err){
  if(err){
    console.log(err);
    res.send("<h1>there is no such user i guess! or you might have entered wrong pass</h1>:(")
  }else{
    passport.authenticate("local")(req,res,function(){

          res.redirect('/secret');
        })
  }
});
});

app.listen(3000, function() {
  console.log("iam ready princess! good to go love!");
});
