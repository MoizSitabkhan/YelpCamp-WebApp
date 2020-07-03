var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose"),
    User = require("./models/user"),
    seedDB = require("./seeds"),
    flash = require("connect-flash"),
    passport = require("passport"),
    methodOverride = require("method-override"),
    expressSession = require("express-session"),
    LocalStrategy = require("passport-local");

var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

//seedDB();
app.use(express.static("public"))
mongoose.connect("mongodb://localhost:27017/auth_demo_app",{useNewUrlParser:true,useUnifiedTopology:true})
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());

//Passport & Session Configuration
app.use(expressSession({
    secret:"Moiz is the best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

//requiring routes
app.use(commentRoutes);
app.use(campgroundRoutes);
app.use(indexRoutes);

app.listen(3000,function(){
    console.log("The YelpCamp Server has started!!")
})