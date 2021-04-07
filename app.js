const express = require('express');
const upload = require('express-fileupload');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const router = express.Router();
const ReviewRoute = require('./ReviewRoute');
const userRoute = require('./routes/userRoute');

app.use(upload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.set('view engine', 'ejs');
const port = process.env.PORT || 5000;
app.listen(port, () => `Server running on port ${port} 🔥`);
const CON_URL = "mongodb://127.0.0.1:27017/fraudAppDB";

//passport config
require('./config/passport')(passport);
//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
//passport middleware
app.use(passport.initialize());
app.use(passport.session());
//connect flash
app.use(flash());

//global variables 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();

});

app.use(ReviewRoute);
app.use(userRoute);



mongoose.connect(CON_URL,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }).then(result => {
        console.log('connected');
    }).catch(err => {
        console.log(err);
    });
