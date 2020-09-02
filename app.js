const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const port = 3000;
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

const url = "mongodb://localhost:27017/userDB"

mongoose.connect(url, { useNewUrlParser: true,  useUnifiedTopology: true });

const userSchema = mongoose.Schema({
    email : String,
    password : String
});

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
               if(results.password === password){
                   res.render("secrets");
               }
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
    const newUser = new User ({
        email : req.body.username,
        password : req.body.password
    });
    newUser.save( (err) => {
        if(!err){
            res.render("secrets");
        }else{
            console.log(err);
        }
    });
})


app.listen(process.env.PORT ||port,  () =>{
    console.log(`listening at http://localhost:${port}`);
});