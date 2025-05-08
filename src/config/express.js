const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const express = require('express'),
    app = express(),
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    router = require('../routes/index');
    path = require('path')


// Set up EJS for rendering views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files like CSS, images, etc.
app.use(express.static(path.join(__dirname, '../public')));



app.use(cors({
    origin:'*'
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
   limit: '50mb',
   extended: true,
   parameterLimit: 50000
}));
app.use(cookieParser());



app.use(session({
    secret: 'R5bj7ymny5T7nHhCfjRSrHYlbouP2pz4', 
    resave: false, 
    saveUninitialized: false, 
    cookie: { secure: false } 
}));

// Initialize Passport and Passport Session
app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.json());
const imgDir = require('path').join(`${__root}`,'/public/files'); 

app.use('/images',express.static(imgDir));


app.use((req,res,next)=>{
    if(!["POST","GET","DELETE","PUT","PATCH","OPTIONS"].includes(req.method)) res.status(403).json({"message":"Mehtod Not allowed"});
        next();
});




app.use('/api/v1',router)
module.exports=app;