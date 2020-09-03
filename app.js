require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const port = 3000;
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


/*
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;*/


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


const url = "mongodb://localhost:27017/userDB"

mongoose.connect(url, { useNewUrlParser: true,  useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});


userSchema.plugin(passportLocalMongoose);

//userSchema.plugin(encrypt, { secret : process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secrets", (req, res) => {
   if(req.isAuthenticated()){
       res.render("secrets");
   }else{
       res.redirect("/login");
   }

})


app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {


   /*  ----     This is auth using bcrypt --------
   const username = req.body.username;
    const password = req.body.password;

    User.findOne({email : username}, (err, results) => {
        if(!err){
            if(results){

                bcrypt.compare(password, results.password, (error, response) => {
                    if(results){
                        res.render("secrets");
                    }

                });
            }
        }else{
            console.log(err)
        }

    })*/

    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, (err) =>{
       if(err){
           console.log(err);
       } else{
          passport.authenticate("local")(req, res, () => {
              res.redirect("/secrets");
          });
       }
    });

});


app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {

   /*   ------ This is registration using bcrypt ----
   bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (!err) {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            newUser.save((err) => {
                if (!err) {
                    res.render("secrets");
                } else {
                    console.log(err);
                }
            });
        }
    });*/

    User.register({username : req.body.username}, req.body.password, (err, user) => {
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, ()=> {
                res.redirect("/secrets")
            });
        }
    })



});

app.get("/logout" , (req, res) =>{
    req.logout();
    res.redirect("/");
});


app.listen(process.env.PORT ||port,  () =>{
    console.log(`listening at http://localhost:${port}`);

});