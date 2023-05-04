var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
var Product = require('../models/productModel');

// Get Category model
var Category = require('../models/categoryModel');

// Get Review model
var Review = require('../models/reviewModel');

// Get Users model
var User = require('../models/userModel');

/*
 * GET all products
 */
router.get('/', function (req, res) {
//router.get('/', isUser, function (req, res) {

    Product.find(function (err, products) {
        if (err) {
            console.log(err);
        } else {
            req.app.locals.products = products;

            res.render('all-products', {
                title: 'All products',
                products: products,
            });
        }
    });

});


/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug})
        .then((c)=>{
            Product.find({category: categorySlug}, function (err, products) {
                if (err){
                    console.log(err);
                } else {       
                res.render('cat-products', {
                    title: c.title,
                    products: products,
                });
               }
            });
        })
        .catch((err)=>{
            console.log(err);
        })
});

/*
 * GET product details
 */
router.get('/:category/:product', function (req, res) {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug: req.params.product})
        .then((product)=>{
            var galleryDir = 'public/product_images/' + product._id + '/gallery';
            
            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {

                    // Get all products to pass to header.ejs
                    Product.find({}).sort({sorting: 1}).exec(function (err, products) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.products = products;      
                        }
                    });

                    galleryImages = files;

                    Review.find({product: product._id})
                    .then(async (reviews)=>{
                    var r_users = [];
                    for(var review of reviews){
                        var data = await User.findById(review.user)
                        r_users.push(data);
                    }
                    res.render('product', {
                        title: product.title,
                        p: product,
                        reviews: reviews,
                        r_users: r_users,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn,
                    })
                    })
                    .catch((err)=>{
                        console.log(err)
                    })
                }
            });
        })
        .catch((err)=>{
            console.log(err);
        })
    })

/*
 * POST product Review
 */
router.post('/:category/:product', function (req, res) {

        req.checkBody('rating', 'Rating must have a value.').isDecimal();
    
        var rating = req.body.rating;
        var message = req.body.message;
        var category = req.params.category;
        var product = req.params.product;
        var errors = req.validationErrors();
    
        if (errors) {
            req.session.errors = errors;
            res.redirect('/products/' + category+ '/' + product);
        } else {
            Review.findOne({product: product, user: req.user._id})
            .then((r)=>{
                if (r) {
                    req.flash('danger', 'This user already reviewed product.');
                    res.redirect('/products/' + category+ '/' + product);
                } else {
                    Product.findOne({slug: product})
                    .then(async(p)=>{

                        var review = new Review({
                            rating: rating,
                            message: message,
                            user: req.user._id,
                            product: p._id,
                        })

                        review.save(function (err) {
                            if (err)
                                console.log(err);
                            req.flash('success', 'Review Added!');
                        });

                        Review.find({product: p._id})
                        .then((reviews)=>{
                            
                            let sum = 0;
                            reviews.forEach(function(r){
                                sum = sum + parseFloat(r.rating);
                            });

                            p.rating = (parseFloat(sum) + parseFloat(rating))/(reviews.length + 1);

                            p.numberOfRatings = (reviews.length + 1);

                            p.save(function(err){
                                if(err)
                                    console.log(err)
                                res.redirect('/products/' + category+ '/' + product);
                            })
                        })
                        .catch((err)=>{
                            console.log(err);
                        });
                    })
                    .catch((err)=>{
                        console.log(err);
                    })
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }
})

// Exports
module.exports = router;


