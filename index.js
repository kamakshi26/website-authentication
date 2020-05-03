//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path=require("path");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});//database url connect

// create user schema
const userSchema=mongoose.Schema({
  email : String,
  password :String
});

// create usermodel
const userModel=mongoose.model("user",userSchema);

app.get('/',function(req,res){
  res.render("home");
});


app.get('/login',function(req,res){
  res.render("login");
});


app.get('/register',function(req,res){
  res.render("register");
});


app.post('/register',function(req,res){
  const newData=new userModel({
    email : req.body.username,
    password :req.body.password
  });
  newData.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.render("secrets");
    }
  });
});



app.post('/login',function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  userModel.findOne({email : username}, function(err,foundvalue){
    if(err){
      console.log(err);
    }else{
      if(foundvalue){
        if(foundvalue.password===password){
          res.render("secrets");
        }else{
          console.log("password didn't match");
        }
      }
    }
  });
});

app.listen(3000,function(){
  console.log("iam ready princess! good to go love!");
});
