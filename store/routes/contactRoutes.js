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
router.get('/', function (req, res) {

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

    res.render('contact', {
        title: page.title,
        content: page.content,
        user: req.user,
    });

    })
    .catch((err)=>{
        console.log(err);
    })
});

/*
 * GET user
 */
router.get('/thanks', function (req, res) {
    res.render('thanks');
})

// Exports
module.exports = router;


