//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
}); //database url connect

// create user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// create usermodel
const userModel = mongoose.model("user", userSchema);

app.get('/', function(req, res) {
  res.render("home");
});


app.get('/login', function(req, res) {
  res.render("login");
});


app.get('/register', function(req, res) {
  res.render("register");
});


app.post('/register', function(req, res) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newData = new userModel({
      email: req.body.username,
      password: hash
    });
    newData.save(function(err) { //encrypt password when you save
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });

  });

});



app.post('/login', function(req, res) {

  const username = req.body.username;
  const password = req.body.password;
  // console.log(password);
  userModel.findOne({
    email: username
  }, function(err, foundvalue) { //decrypt password when you find
    if (err) {
      console.log(err);
    } else {
      if (foundvalue) {

        bcrypt.compare(password, foundvalue.password, function(err, result) {
          // console.log(foundvalue.password);
          if (result) {
            res.render("secrets");
          } else {
            console.log("password not a match");
          }
        });

      }
    }

  });
});

app.listen(3000, function() {
  console.log("iam ready princess! good to go love!");
});
