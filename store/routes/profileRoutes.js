var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Page model
var Page = require('../models/pageModel');

// Get Product model
var Product = require('../models/productModel');

// Get Category model
var Category = require('../models/categoryModel');

// Get Users model
var User = require('../models/userModel');

/*
 * GET user
 */
router.get('/', isUser, function (req, res) {

    //Get all pages 
    Page.findOne({slug: 'profile'})
    .then((page)=>{

    Product.find(function (err, products) {
        if (err){
            console.log(err);
            } else { 
            req.app.locals.products = products;               
        }
    })

    // Get all categories to pass to header.ejs
    Category.find({}).sort({sorting: 1}).exec(function (err, categories) {
        if (err) {
            console.log(err);
        } else {
            req.app.locals.categories = categories;
        }
    });

    res.render('profile', {
        title: page.title,
        content: page.content,
        user: req.user,
        id: req.user._id,
        image: req.user.image,
    });

    })
    .catch((err)=>{
        console.log(err);
    })
});

/*
 * POST edit user
 */
router.post('/', function (req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {

    var id = req.user._id;
    var username = req.user.username;
    var password = req.user.password;
    var email = req.user.email;
    var admin = req.user.admin;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var country = req.body.country;
    var mobileno = req.body.mobileno;
    var address = req.body.address;
    var dob = req.body.dob;

    User.findOne({_id: id})
    .then((user)=>{

            mkdirp('public/user/' + user._id)
            .then(() => console.log('successfully added!'))
            .catch((err) => console.log(err))

            User.findById(id, function (err, user) {
                if (err)
                    return console.log(err);

                user.email = email;
                user.username = username;
                user.password = password;
                user.admin = admin;
                user.firstname = firstname;
                user.lastname = lastname;
                user.dob = dob;
                user.mobileno = mobileno;
                user.country = country;
                user.address = address;

                user.save(function (err) {
                    if (err)
                        return console.log(err);

                    req.flash('success', 'User Details!');
                    res.redirect('/profile');
                });             
            });
    })
    .catch((err)=>{
        console.log(err);
    })

    } else {

        var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
        var id = req.user._id;
        var username = req.user.username;
        var password = req.user.password;
        var email = req.user.email;
        var admin = req.user.admin;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var country = req.body.country;
        var mobileno = req.body.mobileno;
        var address = req.body.address;
        var dob = req.body.dob;
        var pimage = req.body.pimage;
    
        User.findOne({_id: id})
        .then((user)=>{
    
                mkdirp('public/user/' + user._id)
                .then(() => console.log('successfully added!'))
                .catch((err) => console.log(err))
    
                User.findById(id, function (err, user) {
                    if (err)
                        return console.log(err);
    
                    user.email = email;
                    user.username = username;
                    user.password = password;
                    user.admin = admin;
                    user.firstname = firstname;
                    user.lastname = lastname;
                    user.dob = dob;
                    user.mobileno = mobileno;
                    user.country = country;
                    user.address = address;
                    user.image = imageFile;
    
                    if (imageFile != "") {
                        user.image = imageFile;
                    }
    
                    user.save(function (err) {
                        if (err)
                            return console.log(err);
    
                        if (imageFile != "") {
                            fs.remove('public/user/' + id + '/' + pimage, function (err) {
                                if (err)
                                  console.log(err);
                            });
                        }
    
                        var userImage = req.files.image;
                        var path = 'public/user/' + id + '/' + imageFile;
    
                        userImage.mv(path, function (err) {
                            return console.log(err);
                        });
    
                        req.flash('success', 'User Details!');
                        res.redirect('/profile');
                    });             
                });
        })
        .catch((err)=>{
            console.log(err);
        })        
    } 
});


// Exports
module.exports = router;


