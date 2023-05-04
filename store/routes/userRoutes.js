var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

// Get Users model
var User = require('../models/userModel');

/*
 * GET register
 */
router.get('/register', function (req, res) {

    res.render('register', {
        title: 'Register'
    });

});

/*
 * POST register
 */
router.post('/register', function (req, res) {

    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('firstname', 'firstname is required!').notEmpty();
    req.checkBody('lastname', 'lastname is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({username: username})
        .then((user)=>{
            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    email: email,
                    username: username,
                    password: password,
                    admin: 1,
                    image: '',
                    firstname: '',
                    lastname: '',
                    dob: '',
                    mobileno: '',
                    country: '',
                    address: '',
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        })
        .catch((err)=>{
            console.log(err);            
        })
    }
});

/*
 * GET login
 */
router.get('/login', function (req, res) {    

    if (res.locals.user) res.redirect('/');
    
    res.render('login', {
        title: 'Log in'
    });

});

/*
 * POST login
 */
router.post('/login', function (req, res, next) {

    var username = req.body.username;
    var password = req.body.password;

    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('login', {
            errors: errors,
            user: null,
            title: 'Log in'
        });
    }

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next);
    
});

/*
 * GET logout
 */
router.get('/logout', function (req, res, next) {

    req.logout(function(err) {
        if(err) return next(err);
        req.flash('success', 'You are logged out!');
        res.redirect('/users/login');
    });

});

// Exports
module.exports = router;


