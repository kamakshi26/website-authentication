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
  password: String
});

userSchema.plugin(passportlocalmongoose);
// create usermodel
const userModel = mongoose.model("user", userSchema);

passport.use(userModel.createStrategy());

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.get('/', function(req, res) {
  res.render("home");
});


app.get('/login', function(req, res) {
  res.render("login");
});


app.get('/register', function(req, res) {
  res.render("register");
});

app.get('/secrets',function(req,res){
  if(req.isAuthenticated()){
    res.render('secrets');
  }else{
    res.redirect('/login');
  }
});

app.post('/register', function(req, res) {
userModel.register({username : req.body.username}, req.body.password, function(err,user){
  if(err){
    console.log(err);
    res.send('<h1>seems like you are already registered! try a new user name or else go to login page! thank you:)</h1>');
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect('/secrets');
    })
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

          res.redirect('/secrets');
        })
  }
});
});

app.listen(3000, function() {
  console.log("iam ready princess! good to go love!");
});
