var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Category model
var Category = require('../models/categoryModel');

/*
 * GET category index
 */
router.get('/', isAdmin, function (req, res) {
    Category.find({}).sort({sorting: 1}).exec(function (err, categories) {
        if (err)
            return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

/*
 * GET add category
 */
router.get('/add-category',isAdmin, function (req, res) {

    var title = "";

    res.render('admin/add-category', {
        title: title
    });

});

/*
 * POST add category
 */
router.post('/add-category', function (req, res) {
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add-category', {
            errors: errors,
            title: title
        });
    } else {
        Category.findOne({slug: slug})
        .then((category)=>{            
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/add-category', {
                    title: title
                });
            } else {
                var category = new Category({
                    title: title,
                    slug: slug,
                    image: imageFile,
                    sorting: 100,
                });

                category.save(async function (err) {
                    if (err) return console.log(err);

                    await mkdirp('public/category_images/' + category._id)
                    .then(() => console.log('successfully added!'))
                    .catch((err) => console.log(err))

                    
                    if (imageFile != "") {
                        var categoryImage = req.files.image;
                        var path = 'public/category_images/' + category._id + '/' + imageFile;
                        console.log(categoryImage)
                        console.log(path)
                        categoryImage.mv(path, function(err){
                            if(err) console.log(err)
                            else console.log('successfully moved!');
                        });
                    }

                    Category.find({}).sort({sorting: 1}).exec(function (err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });

                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                });
            }
        })
        .catch((err)=>{
            console.log(err)
        })
    }
});


// Sort pages function
function sortCategories(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Category.findById(id, function (err, category) {
                category.sorting = count;
                category.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }
}

/*
 * POST reorder pages
 */
router.post('/reorder-categories', function (req, res) {
    var ids = req.body['id[]'];

    sortCategories(ids, function () {
        Category.find({}).sort({sorting: 1}).exec(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });
    });

});

/*
 * GET edit category
 */
router.get('/edit-category/:id',isAdmin, function (req, res) {
    var errors;
    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Category.findById(req.params.id, function (err, category) {
        if (err){
            console.log(err);
            res.redirect('/admin/categories')
        } else {
        res.render('admin/edit-category', {
            title: category.title,
            errors: errors,
            image: category.image,
            id: category._id
        });
      }
    });

});

/*
 * POST edit category
 */
router.post('/edit-category/:id', function (req, res) {


    if (!req.files || Object.keys(req.files).length === 0) {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.render('admin/edit-category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id: {'$ne': id}})
        .then((category)=>{
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/edit-category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function (err, category) {
                    if (err)
                        return console.log(err);

                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err)
                            return console.log(err);

                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });

                        req.flash('success', 'Category edited!');
                        res.redirect('/admin/categories/edit-category/' + id);
                    });

                });
            }
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    } else {
        var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

        req.checkBody('title', 'Title must have a value.').notEmpty();
        req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();
        var id = req.params.id;
        var pimage = req.body.pimage;
    
        var errors = req.validationErrors();
    
        if (errors) {
            req.session.errors = errors;
            res.render('admin/edit-category', {
                errors: errors,
                title: title,
                id: id
            });
        } else {
            Category.findOne({slug: slug, _id: {'$ne': id}})
            .then((category)=>{
                if (category) {
                    req.flash('danger', 'Category title exists, choose another.');
                    res.render('admin/edit-category', {
                        title: title,
                        id: id
                    });
                } else {
                    Category.findById(id, function (err, category) {
                        if (err)
                            return console.log(err);
    
                        category.title = title;
                        category.slug = slug;
                        if (imageFile != "") {
                            category.image = imageFile;
                        }
                        category.save(function (err) {
                            if (err)
                                return console.log(err);
    
                            if (imageFile != "") {
                                if (pimage != "") {
                                    fs.remove('public/category_images/' + id + '/' + pimage, function (err) {
                                        if (err)
                                            console.log(err);
                                    });
                            }
                        }
    
                            var categoryImage = req.files.image;
                            var path = 'public/category_images/' + id + '/' + imageFile;
    
                            categoryImage.mv(path, function (err) {
                                return console.log(err);
                            });
    
                            Category.find(function (err, categories) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    req.app.locals.categories = categories;
                                }
                            });
    
                            req.flash('success', 'Category edited!');
                            res.redirect('/admin/categories/edit-category/' + id);
                        });
    
                    });
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }
    }
});

/*
 * GET delete category
 */
router.get('/delete-category/:id',isAdmin, function (req, res) {
    var id = req.params.id;
    var path = 'public/category_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
        Category.findByIdAndRemove(id, function (err) {
            if (err)
                return console.log(err);

            Category.find({}).sort({sorting: 1}).exec(function (err, categories) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.categories = categories;
                }
            });
        req.flash('success', 'Category deleted!');
        res.redirect('/admin/categories/');
    })
    }   
})
});


// Exports
module.exports = router;


