require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const fileUpload = require('express-fileupload');
const resizeImg = require('resize-img');
const expressValidator = require('express-validator');
const InitiateMongoServer = require("./config/db");
const passport = require('passport');

//default currency
const currencies =
[{currency: 'USD', symbol: '&#36', code: 'us'},
 {currency: 'GHS', symbol: 'GH&#162', code: 'gh'},
 {currency: 'GBP', symbol: '&#163', code: 'gb'},
 {currency: 'CAD', symbol: 'C&#36', code: 'ca'}];

app.locals.currencies = currencies;

app.locals.currency = app.locals.currencies[0].currency;

app.locals.product_lengths = null;

app.locals.exrate = 1;

app.locals.data = [];

// Initiate Mongo Server
InitiateMongoServer();

app.use(cors());

// set view engine
app.use(express.static(__dirname + "/views"));
app.set("view engine", "ejs");
app.use(express.json());


// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// set global errors
app.locals.errors = null;

// Get Carousel Model
var Carousel = require('./models/carouselModel');

// Get all pages to pass to header.ejs
Carousel.find({}).sort({sorting: 1}).exec(function (err, carousels) {
    if (err) {
        console.log(err);
    } else {
        app.locals.carousels = carousels;
    }
});

// Get Company Model
var Company = require('./models/companyModel');

// Get all companys to pass to header.ejs
Company.find({}).sort({sorting: 1}).exec(function (err, companys) {
    if (err) {
        console.log(err);
    } else {
        app.locals.companys = companys;
    }
});

// Get page model
var Page = require('./models/pageModel');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
var Category = require('./models/categoryModel');

// Get all categories to pass to header.ejs
Category.find({}).sort({sorting: 1}).exec(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;

        //Get categorised product lengths
        let product_lengths=[];
        app.locals.categories.forEach(function(c){
        Product.countDocuments({category: c.slug}, function (err, product_count) {
        if (err)
            console.log(err);
        product_lengths.push({'category': c.slug, 'length': product_count});
        app.locals.product_lengths = product_lengths;
    });
})
    }
});

//Get product model
var Product = require('./models/productModel');

// Get all products to pass to header.ejs
Product.find({}).sort({sorting: 1}).exec(function (err, products) {
    if (err) {
        console.log(err);
    } else {
        app.locals.products = products;      
    }
});

// Express fileUpload middleware
app.use(fileUpload());

// Body Parser middleware
// 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

// Express Session middleware
// app.use(session({
//     secret: process.env.TOKEN_KEY,
//     resave: false,
//     saveUninitialized: true,
//     // cookie: { secure: true },
// }));

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    secret: process.env.TOKEN_KEY,
    saveUninitialized: true,
}))

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
  res.locals.cart = req.session.cart;
  res.locals.wishlist = req.session.wishlist;
  res.locals.user = req.user || null;
  next();
});

// Set routes 
var pages = require('./routes/pagesRoutes.js');
var products = require('./routes/productRoutes.js');
var cart = require('./routes/cartRoutes.js');
var users = require('./routes/userRoutes.js');
var adminPages = require('./routes/adminPagesRoutes.js');
var adminCategories = require('./routes/adminCategoryRoutes.js');
var adminProducts = require('./routes/adminProductRoutes.js');
var adminCarousel = require('./routes/adminCarouselRoutes.js');
var adminCompany = require('./routes/adminCompanyRoutes.js');
var wishlist = require('./routes/wishlistRoutes.js');
var profile = require('./routes/profileRoutes.js');
var contact = require('./routes/contactRoutes.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/admin/carousel', adminCarousel);
app.use('/admin/company', adminCompany);
app.use('/profile', profile);
app.use('/products', products);
app.use('/contact', contact);
app.use('/cart', cart);
app.use('/wishlist', wishlist);
app.use('/users', users);
app.use('/', pages);

app.listen(process.env.APP_PORT, function () {
  console.log("Server running on port: " + process.env.APP_PORT);
});
