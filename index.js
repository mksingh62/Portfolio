// first import install libery 
var express = require("express");
var bodyParse = require("body-parser");
var mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const path = require("path");
const cons = require('consolidate');
const bcrypt = require('bcryptjs')
// const Register = require("./registers")
// const Register = require("./registers/msg")
// const Register2 = require("/registers/Regist")
const { Register, Register2 , Register3 } = require('./registers');
require('dotenv').config();

// Add environment variable checks
const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SESSION_SECRET',
    'MONGODB_URI',
    'JWT_SECRET',
    'GMAIL_USER',
    'GMAIL_PASS'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

// Log environment (but not sensitive values)
console.log('Environment:', process.env.NODE_ENV);
console.log('Google Client ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Google Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET);

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');



// Initialize passport and session middleware

// Start server




const nodemailer= require('nodemailer');


//create app
var mail;
const app = express()

const port = process.env.PORT || 3000;
const staticpath = path.join(__dirname, "public/views");
const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';
app.use(bodyParse.json())
app.use(express.static('public'))
app.use(bodyParse.urlencoded({
    extended: true
}))


// conect database


// view engine setup
app.engine('html', cons.swig)
app.set('views', staticpath);
app.set('view engine', 'html');

// mongoose.connect("mongodb://127.0.0.1:27017/registrationFrom", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })

var db = mongoose.connection;

// check connect

db.on('error', () => console.log("error in connecting database"));
db.once('open', () => console.log("Connected to Database"));


app.get("/", (req, res) => {

    // res.set({
    //     "Allow-access-Allow-Origin": '*'
    // })

    // return res.redirect('index.html');
    res.render("index");

})


app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const usermail = await Register2.findOne({ email: email });
        // const userData = await Register2.findById({ _id:req.body.id})
        // console.log(userData);
        // res.sendStatus(usermail.password)
        console.log(usermail.id);

        if (usermail.password == password) {
            
            res.render("index")

        }
        else {

            res.send("password is wrong")

        }





    } catch (err) {
        res.status(400).send(err);
    }

})

app.post("/signup", async (req, res) => {
    try {
        console.log(req.body.password)
        console.log(req.body.email)
        const salt = await bcrypt.genSalt(10);
        const hsahedPassword = await bcrypt.hash(req.body.password,salt);
        console.log(hsahedPassword);
        registerEmployee = new Register2({
            email: req.body.email,
            password: hsahedPassword,
            confirmPassword: hsahedPassword
        });
        // res.send(registerEmployee);
        const registered = await registerEmployee.save();
        res.render("index")

        // res.status(201).send(registerEmployee);

    } catch (err) {
        res.status(400).send(err);
    }

})

app.get("/reset", (req, res) => {
    return res.redirect('login.html');
})
app.post("/reset", async (req, res) => {
    try {
        const email = req.body.email;
        mail = req.body.email;
        console.log(mail);
        const usermail = await Register2.findOne({ email: email });


        if (email !== usermail.email) {
            res.send("user not register")
            return;
        }


        const secret = JWT_SECRET + usermail.password
        const payload = {
            email: usermail.email,
            id: usermail.id
        }

        const token = jwt.sign(payload, secret, { expiresIn: '15m' })
        const link = `${BASE_URL}/reset-password/${usermail.id}/${token}`
        const transporter = nodemailer.createTransport({
            service:'gmail',
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
          });
        
          const mailOptions= {
            from: {
                name:'Mohit',
                address: process.env.GMAIL_USER
            }, // sender address
            to: req.body.email, // list of receivers
            subject: "Reset Your Password", // Subject line
            text: link, // plain text body
         
          }
          const sendMail = async (transporter,mailOptions)=>{
            try {
                await transporter.sendMail(mailOptions);
                console.log("email has been sent successfully")
            }catch(error){
                console.error(error);
            }
          }
        sendMail(transporter,mailOptions);
        console.log(link)
        res.send("the reset link has been sent to your email")






    } catch (err) {
        res.status(400).send(err);
    }

});


app.use(session({ 
    secret: process.env.SESSION_SECRET || 'your-fallback-secret-key', 
    resave: true, 
    saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? 'https://myportfolio-s5g7.onrender.com/auth/google/callback'
        : `http://localhost:${port}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
    // This is where you would typically save user details to your database
    
    const googleAuthData = new Register3({
        displayName:profile.displayName,
        googleId:profile.id,
        emails:profile.emails[0].value,
        photos:profile.photos[0].value
      });
  
      // Save the document to MongoDB
      googleAuthData.save();
  
    
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Routes

// app.get('/', (req, res) => {
//     res.render("index");
// });


app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
passport.authenticate('google', { 
    successRedirect: process.env.NODE_ENV === 'production'
        ? 'https://myportfolio-s5g7.onrender.com/'
        : 'http://localhost:3005/',
    failureRedirect: '/'
}));




app.get('/reset-password/:id/:token', async (req, res) => {
    

        const usermail = await Register2.findOne({ email: mail });
        console.log(usermail)
        const { id, token } = req.params;
        // res.send(req.params)
        if (id !== usermail.id) {
            res.send("invalid id...");
            return;
        }

        const secret = JWT_SECRET + usermail.password;
    try {    
        const payload = jwt.verify(token, secret);
        res.render('reset-password', { email: usermail.email });

    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});
                        
app.post('/reset-password/:id/:token', async (req, res) => {
    const usermail = await Register2.findOne({ email: mail });
    const { id, token } = req.params;
    const{password, password2} = req.body;
    if (id !== usermail.id) {
        res.send("invalid id...");
        return;
    }
    const secret = JWT_SECRET + usermail.password;
    try {
        
        const payload = jwt.verify(token, secret);
        usermail.password = password;
        usermail.confirmPassword = password2;
        usermail.save();
        res.send("your data is updated successfully")
        
        


    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }

})

app.get('/message', async(req,res)=>{
    return res.redirect('login.html');
})


app.post('/message', async(req,res)=>{
    try {
        
        sendMsg = new Register({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message
        });
        // res.send(registerEmployee);
        const sendMessage = await sendMsg.save();
        res.render("index")

        // res.status(201).send(registerEmployee);

    }catch (err) {
        res.status(400).send(err);
    }
})

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})
