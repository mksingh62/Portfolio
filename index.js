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
const BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://myportfolio-s5g7.onrender.com'
    : 'http://localhost:3005';

// Middleware setup
app.use(bodyParse.json())
app.use(express.static('public'))
app.use(bodyParse.urlencoded({
    extended: true
}))

// Session configuration
app.use(session({ 
    secret: process.env.SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// view engine setup
app.engine('html', cons.swig)
app.set('views', staticpath);
app.set('view engine', 'html');

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
        console.log('Login request body:', req.body); // Debug log
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing email or password in request'); // Debug log
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        const user = await Register2.findOne({ email: email });
        console.log('Database query result:', user ? 'User found' : 'User not found'); // Debug log
        
        if (!user) {
            console.log('User not found:', email); // Debug log
            return res.status(400).json({ error: "Email not registered. Please sign up first." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch ? 'Password matches' : 'Password does not match'); // Debug log
        
        if (!isMatch) {
            console.log('Invalid password for user:', email); // Debug log
            return res.status(400).json({ error: "Invalid password" });
        }

        console.log('Login successful for:', email); // Debug log

        // Create session
        req.session.user = {
            id: user._id,
            email: user.email
        };
        
        // Save session before redirect
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: "Server error" });
            }
            res.json({ 
                success: true, 
                user: {
                    email: user.email
                }
            });
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/signup", async (req, res) => {
    try {
        console.log('Received signup request body:', req.body); // Debug log
        
        const { email, password, confirmPassword } = req.body;

        // Validate input
        if (!email || !password || !confirmPassword) {
            console.log('Missing fields:', { email, password, confirmPassword }); // Debug log
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await Register2.findOne({ email });
        console.log('Existing user check result:', existingUser ? 'User exists' : 'No existing user'); // Debug log
        
        if (existingUser) {
            console.log('Email already registered:', email); // Debug log
            return res.status(400).json({ error: "This email is already registered. Please login instead." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new Register2({
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword // Store hashed password in confirmPassword field too
        });

        // Save user
        await newUser.save();
        console.log('User saved successfully:', newUser.email); // Debug log

        // Create session
        req.session.user = {
            id: newUser._id,
            email: newUser.email
        };

        // Save session before redirect
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: "Server error" });
            }
            console.log('Session saved successfully'); // Debug log
            res.json({ 
                success: true, 
                user: {
                    email: newUser.email
                }
            });
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

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
        const link = `http://localhost:3005/reset-password/${usermail.id}/${token}`
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
                address: "mksinghmksinghmk@gmail.com"
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


// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const googleAuthData = new Register3({
            displayName: profile.displayName,
            googleId: profile.id,
            emails: profile.emails[0].value,
            photos: profile.photos[0].value
        });
        
        await googleAuthData.save();
        return done(null, profile);
    } catch (err) {
        return done(err);
    }
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
        successRedirect: `${BASE_URL}/`,
        failureRedirect: '/'
    })
);




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
        // Create message in database
        sendMsg = new Register({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message
        });
        const sendMessage = await sendMsg.save();

        // Send email notification
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = {
            from: {
                name: 'Portfolio Contact Form',
                address: process.env.GMAIL_USER
            },
            to: process.env.GMAIL_USER, // Send to your email
            subject: `New Contact Form Message from ${req.body.name}`,
            text: `
                Name: ${req.body.name}
                Email: ${req.body.email}
                Subject: ${req.body.subject}
                Message: ${req.body.message}
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Contact form message email sent successfully");
        
        res.render("index");
    } catch (err) {
        console.error("Error in message route:", err);
        res.status(400).send(err);
    }
})

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: "Error during logout" });
        }
        res.json({ success: true });
    });
});

// Keep the GET route for backward compatibility
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

// Protected route example
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});

// Check authentication status
app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            user: {
                email: req.session.user.email
            }
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})
