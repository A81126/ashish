const express = require('express');
const router = express.Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const { logger } = require('../logger/logger');


router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/addUser', (req, res) => {
    res.render('addUser');
})
router.post('/addUser', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('addUser', {
            errors,
            name,
            email,
            password,
            password2
        });

    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                //user exist 
                errors.push({ msg: 'Email already registered' });
                res.render('addUser', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save().then(result => {
                            req.flash('success_msg', 'User added Successfully');
                            res.redirect('/addUser');
                        }).catch(err => {

                        })
                        console.log(newUser);

                    })
                })

            }
        }).catch(err => {

        });
    }
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    const user = req.user;
    logger.info({ user }, 'user logged in success');
    res.render('dashboard', { name: req.user.name });
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});



module.exports = router;