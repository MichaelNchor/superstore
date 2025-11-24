var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
var Product = require('../models/productModel');


/*
 * GET checkout page
 */
router.get('/', function (req, res) {

    var loggedIn = (req.isAuthenticated()) ? true : false;

    if (req.session.wishlist && req.session.wishlist.length == 0) {
        delete req.session.wishlist;
        res.redirect('/wishlist');
    } else {
        res.render('wishlist', {
            title: 'wishlist',
            wishlist: req.session.wishlist,
            loggedIn: loggedIn
        });
    }

});


/*
 * GET add product to wishlist
 */
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;
    var isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

    Product.findOne({slug: slug})
    .then((p)=>{
        if (typeof req.session.wishlist == "undefined") {
            req.session.wishlist = [];
            req.session.wishlist.push({
                title: p.title, 
                slug: slug,
                qty: 1,
                category: p.category,
                desc: p.desc,
                desc_short: p.desc_short,
                discount: p.discount,
                rating: p.rating,
                numberOfRatings: p.numberOfRatings,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var wishlist = req.session.wishlist;
            var newItem = true;

            for (var i = 0; i < wishlist.length; i++) {
                if (wishlist[i].title == slug) {
                    wishlist[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                wishlist.push({
                    title: p.title, 
                    slug: slug,
                    qty: 1, 
                    category: p.category,
                    desc: p.desc,
                    desc_short: p.desc_short,
                    discount: p.discount,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

        console.log(req.session.wishlist);
        
        // Return JSON for AJAX requests
        if (isAjax) {
            return res.json({
                success: true,
                message: 'Product added to wishlist!',
                wishlistCount: req.session.wishlist.length
            });
        }
        
        req.flash('success', 'Product added!');
        res.redirect('back');
    })
    .catch((err)=>{
        console.log(err);
        if (isAjax) {
            return res.json({
                success: false,
                message: 'Error adding product to wishlist'
            });
        }
        req.flash('error', 'Error adding product');
        res.redirect('back');
    })
});

/*
 * GET checkout page
 */

router.get('/checkout', function (req, res) {

    if (req.session.wishlist && req.session.wishlist.length == 0) {
        delete req.session.wishlist;
        res.redirect('/cart');
    } else {
        res.render('wishlist', {
            title: 'Wishlist',
            wishlist: req.session.wishlist
        });
    }

});

/*
 * GET update product
 */
router.get('/update/:product', function (req, res) {

    var slug = req.params.product;
    var wishlist = req.session.wishlist;
    var action = req.query.action;
    var isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

    for (var i = 0; i < wishlist.length; i++) {
        if (wishlist[i].title == slug) {
            switch (action) {
                case "add":
                    wishlist[i].qty++;
                    break;
                case "remove":
                    wishlist[i].qty--;
                    if (wishlist[i].qty < 1)
                        wishlist.splice(i, 1);
                    break;
                case "clear":
                    wishlist.splice(i, 1);
                    if (wishlist.length == 0)
                        delete req.session.wishlist;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    // Return JSON for AJAX requests
    if (isAjax) {
        return res.json({
            success: true,
            message: 'Wishlist updated!',
            wishlistCount: req.session.wishlist ? req.session.wishlist.length : 0
        });
    }

    req.flash('success', 'wishlist updated!');
    res.redirect('/wishlist');

});

/*
 * GET clear wishlist
 */
router.get('/clear/:product?', function (req, res) {

    var isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
    var slug = req.params.product;
    
    if (slug) {
        // Clear specific item
        var wishlist = req.session.wishlist;
        if (wishlist) {
            for (var i = 0; i < wishlist.length; i++) {
                if (wishlist[i].title == slug) {
                    wishlist.splice(i, 1);
                    break;
                }
            }
            if (wishlist.length == 0) {
                delete req.session.wishlist;
            }
        }
    } else {
        // Clear entire wishlist
        delete req.session.wishlist;
    }
    
    // Return JSON for AJAX requests
    if (isAjax) {
        return res.json({
            success: true,
            message: slug ? 'Item removed from wishlist!' : 'Wishlist cleared!',
            wishlistCount: req.session.wishlist ? req.session.wishlist.length : 0
        });
    }
    
    req.flash('success', slug ? 'Item removed!' : 'wishlist cleared!');
    res.redirect('/wishlist');

});

/*
 * GET buy now
 */
router.get('/buynow', function (req, res) {

    delete req.session.wishlist;
    
    res.sendStatus(200);

});

// Exports
module.exports = router;


