var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product model
var Product = require('../models/productModel');

// Get Category model
var Category = require('../models/categoryModel');

/*
 * GET products index
 */
router.get('/',isAdmin, function (req, res) {
    var count;

    Product.count(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

/*
 * GET add product
 */
router.get('/add-product',isAdmin, function (req, res) {

    var title = "";
    var desc_short = "";
    var desc = "";
    var price = 0;
    var discount = 0;
    var rating = 0;
    var numberOfRatings = 0;

    Category.find(function (err, categories) {
        res.render('admin/add-product', {
            title: title,
            desc_short: desc_short,
            desc: desc,
            categories: categories,
            discount: discount,
            price: price,
            rating: rating,
            numberOfRatings: numberOfRatings,
        });
    });
});

/*
 * POST add product
 */
router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc_short', 'Short Description must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('discount', 'Discount must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc_short = req.body.desc_short;
    var desc = req.body.desc;
    var price = req.body.price;
    var discount = req.body.discount;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add-product', {
                errors: errors,
                title: title,
                desc_short: desc_short,
                desc: desc,
                categories: categories,
                price: price,
                discount: discount,
            });
        });
    } else {
        Product.findOne({slug: slug})
        .then((product)=>{
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find({})
                .then((categories)=> {
                    res.render('admin/add-product', {
                        title: title,
                        desc_short: desc_short,
                        desc: desc,
                        categories: categories,
                        price: price,
                        discount: discount,
                    });
                })
                .catch((err)=>{
                    console.log(err)
                })
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc_short: desc_short,
                    desc: desc,
                    price: price2,
                    discount: discount,
                    category: category,
                    image: imageFile,
                    rating: 0,
                    numberOfRatings: 0,
                });

                product.save(async function (err) {
                    if (err) return console.log(err);

                    await mkdirp('public/product_images/' + product._id)
                    .then(() => console.log('successfully added!'))
                    .catch((err) => console.log(err))

                    mkdirp('public/product_images/' + product._id + '/gallery')
                    .then(() => console.log('successfully added!'))
                    .catch((err) => console.log(err))

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs')
                    .then(() => console.log('successfully added!'))
                    .catch((err) => console.log(err))

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;
                        console.log(productImage)
                        console.log(path)
                        productImage.mv(path, function(err){
                            if(err) console.log(err)
                            else console.log('successfully moved!');
                        })
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                    })
                }
            })
            .catch((err)=>{console.log(err)
        })
    }
});

/*
 * GET edit product
 */
router.get('/edit-product/:id',isAdmin, function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit-product', {
                            title: p.title,
                            errors: errors,
                            desc_short: p.desc_short,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            discount: p.discount,
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });
    });
});

/*
 * POST edit product
 */
router.post('/edit-product/:id', function (req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc_short', 'Short Description must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('discount', 'Discount must have a value.').isDecimal();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc_short = req.body.desc_short;
    var desc = req.body.desc;
    var price = req.body.price;
    var discount = req.body.discount;
    var category = req.body.category;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc_short = desc_short;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.discount = discount;
                    p.category = category;

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }

    } else {
        var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

        req.checkBody('title', 'Title must have a value.').notEmpty();
        req.checkBody('desc_short', 'Short Description must have a value.').notEmpty();
        req.checkBody('desc', 'Description must have a value.').notEmpty();
        req.checkBody('price', 'Price must have a value.').isDecimal();
        req.checkBody('discount', 'Discount must have a value.').isDecimal();
        req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();
        var desc_short = req.body.desc_short;
        var desc = req.body.desc;
        var price = req.body.price;
        var discount = req.body.discount;
        var category = req.body.category;
        var pimage = req.body.pimage;
        var id = req.params.id;
    
        var errors = req.validationErrors();
    
        if (errors) {
            req.session.errors = errors;
            res.redirect('/admin/products/edit-product/' + id);
        } else {
            Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
                if (err)
                    console.log(err);
    
                if (p) {
                    req.flash('danger', 'Product title exists, choose another.');
                    res.redirect('/admin/products/edit-product/' + id);
                } else {
                    Product.findById(id, function (err, p) {
                        if (err)
                            console.log(err);
    
                        p.title = title;
                        p.slug = slug;
                        p.desc_short = desc_short;
                        p.desc = desc;
                        p.price = parseFloat(price).toFixed(2);
                        p.discount = discount;
                        p.category = category;

                        if (imageFile != "") {
                            p.image = imageFile;
                        }
    
                        p.save(function (err) {
                            if (err)
                                console.log(err);
    
                            if (imageFile != "") {
                                if (pimage != "") {
                                    fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                        if (err)
                                            console.log(err);
                                    });
                                }
    
                                var productImage = req.files.image;
                                var path = 'public/product_images/' + id + '/' + imageFile;
    
                                productImage.mv(path, function (err) {
                                    return console.log(err);
                                });
    
                            }
    
                            req.flash('success', 'Product edited!');
                            res.redirect('/admin/products/edit-product/' + id);
                        });
    
                    });
                }
            });
        }    
    }
});

/*
 * POST product gallery
 */
router.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});

/*
 * GET delete image
 */
router.get('/delete-image/:image',isAdmin, function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

/*
 * GET delete product
 */
router.get('/delete-product/:id',isAdmin, function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });

});

// Exports
module.exports = router;
