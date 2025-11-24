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

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart');
    } else {
        res.render('cart', {
            title: 'Cart',
            cart: req.session.cart,
            loggedIn: loggedIn
        });
    }

});


/*
 * GET add product to cart
 */
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;
    var isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

    Product.findOne({slug: slug})
    .then((p)=>{
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1, 
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

        console.log(req.session.cart);
        
        // Return JSON for AJAX requests
        if (isAjax) {
            return res.json({
                success: true,
                message: 'Product added to cart!',
                cartCount: req.session.cart.length
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
                message: 'Failed to add product'
            });
        }
        req.flash('danger', 'Error adding product');
        res.redirect('back');
    })
});

/*
 * GET checkout page
 */

router.get('/checkout', isUser, function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            user: req.user,
            cart: req.session.cart
        });
    }
});

/*
 * GET update product
 */
router.get('/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;
    var isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
    var newQuantity = 0;
    var subtotal = 0;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    newQuantity = cart[i].qty;
                    subtotal = cart[i].qty * cart[i].price;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1) {
                        cart.splice(i, 1);
                        newQuantity = 0;
                    } else {
                        newQuantity = cart[i].qty;
                        subtotal = cart[i].qty * cart[i].price;
                    }
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    newQuantity = 0;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    // Calculate total
    var total = 0;
    if (req.session.cart) {
        for (var i = 0; i < req.session.cart.length; i++) {
            total += req.session.cart[i].qty * req.session.cart[i].price;
        }
    }

    // Return JSON for AJAX requests
    if (isAjax) {
        return res.json({
            success: true,
            message: 'Cart updated!',
            cartCount: req.session.cart ? req.session.cart.length : 0,
            newQuantity: newQuantity,
            subtotal: parseFloat(subtotal),
            total: parseFloat(total)
        });
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart');

});

/*
 * GET clear cart
 */
router.get('/clear/:product?', function (req, res) {

    var isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
    var slug = req.params.product;
    
    if (slug) {
        // Clear specific item
        var cart = req.session.cart;
        if (cart) {
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart.splice(i, 1);
                    break;
                }
            }
            if (cart.length == 0) {
                delete req.session.cart;
            }
        }
    } else {
        // Clear entire cart
        delete req.session.cart;
    }
    
    // Calculate total
    var total = 0;
    if (req.session.cart) {
        for (var i = 0; i < req.session.cart.length; i++) {
            total += req.session.cart[i].qty * req.session.cart[i].price;
        }
    }
    
    // Return JSON for AJAX requests
    if (isAjax) {
        return res.json({
            success: true,
            message: slug ? 'Item removed from cart!' : 'Cart cleared!',
            cartCount: req.session.cart ? req.session.cart.length : 0,
            total: parseFloat(total)
        });
    }
    
    req.flash('success', slug ? 'Item removed!' : 'Cart cleared!');
    res.redirect('/cart');

});

/*
 * GET buy now
 */
router.get('/buynow', function (req, res) {

    delete req.session.cart;
    
    res.sendStatus(200);

});

// Exports
module.exports = router;


