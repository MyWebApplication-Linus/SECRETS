require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const port = 3000;
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

const url = "mongodb://localhost:27017/userDB"

mongoose.connect(url, { useNewUrlParser: true,  useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

//userSchema.plugin(encrypt, { secret : process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});


app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {


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

    })

});


app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {

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
    });
})


app.listen(process.env.PORT ||port,  () =>{
    console.log(`listening at http://localhost:${port}`);

});