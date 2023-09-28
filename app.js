var express = require("express");
var app = express();
var passwordHash = require('password-hash');
//var hashedPassword = passwordHash.generate('password123');
app.use(express.static('public'));

app.set("view engine","ejs");

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore,Filter } = require('firebase-admin/firestore');
var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/" + "home.html");
});

app.get("/signupSubmit", function (req, res) {
 
    db.collection("signup")
    .where(
        Filter.or(
            Filter.where("email","==",req.query.email),
            Filter.where("username","==",req.query.username)
        )
    )
    .get()
    .then((docs)=>{
        if(docs.size>0){
            res.send("this account is already existed,please try with another email or username")
        }
        else{
            
                db.collection('signup').add({
                username: req.query.username,
                email: req.query.email,
                password: passwordHash.generate(req.query.password)
            }).then(() => {
                res.sendFile(__dirname + "/public/" + "login.html"); 
            }).catch(()=>{
                res.send("something went wrong")
            });
          
            
        }
    });
    
});


app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/" + "home.html"); 
});
app.get("/loginSubmit", function (req, res) {
   
    db.collection('Signup')
   .where("email","==",req.query.email)
   .get()

  .then((docs)=>{
      var verified=false;
      docs.forEach((doc)=>{
        verified=passwordHash.verify(req.query.Password,doc.data().Password)
      });
    if(verified){
        res.redirect("/home.html");
     }
     else{
        res.send("you have failed logging in please check once again");
    }
    });
    
  
});





//     if(docs.size>0){
//           res.redirect("/food.html");
 //       }
//     else{
 //           res.send("you have failed logging in please check once again");
//        }

app.listen("4002")
