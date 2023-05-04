var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Category model
var Carousel = require('../models/carouselModel');

/*
 * GET pages index
 */
router.get('/',isAdmin, function (req, res) {
    Carousel.find({}).sort({sorting: 1}).exec(function (err, carousels) {
        if (err)
            return console.log(err);
        res.render('admin/carousel', {
            carousels: carousels
        });
    });
});

/*
 * GET add product
 */
router.get('/add-carousel-slide',isAdmin, function (req, res) {

    var title = "";
    var subtext = "";

    res.render('admin/add-carousel-slide', {
        title: title,
        subtext: subtext,
    });
});

/*
 * POST add product
 */
router.post('/add-carousel-slide', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('subtext', 'Subtext must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var subtext = req.body.subtext;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add-carousel-slide', {
            errors: errors,
            title: title,
            slug: slug,
            subtext: subtext,
        });
    } else {
        Carousel.findOne({slug: slug})
        .then((carousel)=>{
            if (carousel) {
                req.flash('danger', 'Slide title exists, choose another.');
                    res.render('admin/add-carousel-slide', {
                        title: title,
                        slug: slug,
                        subtext: subtext,
                    });
            } else {

            var carousel = new Carousel({
                title: title,
                slug: slug,
                subtext: subtext,
                image: imageFile,
                sorting: 100,
            });

            carousel.save(async function (err) {
                if (err) return console.log(err);

                await mkdirp('public/carousel/' + carousel._id)
                .then(() => console.log('successfully added!'))
                .catch((err) => console.log(err))

                
                if (imageFile != "") {
                    var carouselImage = req.files.image;
                    var path = 'public/carousel/' + carousel._id + '/' + imageFile;
                    console.log(carouselImage)
                    console.log(path)
                    carouselImage.mv(path, function(err){
                        if(err) console.log(err)
                        else console.log('successfully moved!');
                    });
                }

                req.flash('success', 'Category added!');
                res.redirect('/admin/carousel');
            });
            }
        })
        .catch((err)=>{
            console.log(err)
        })
    }
});

// Sort pages function
function sortCarousel(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Carousel.findById(id, function (err, carousel) {
                carousel.sorting = count;
                carousel.save(function (err) {
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
 * POST reorder carousel slide
 */
router.post('/reorder-carousel-slide', function (req, res) {
    var ids = req.body['id[]'];

    sortCarousel(ids, function () {
        Carousel.find({}).sort({sorting: 1}).exec(function (err, carousels) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.carousels = carousels;
            }
        });
    });

});

/*
 * GET edit carousel slide
 */
router.get('/edit-carousel-slide/:id',isAdmin, function (req, res) {
    var errors;
    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Carousel.findById(req.params.id, function (err, carousel) {
        if (err){
            console.log(err);
            res.redirect('/admin/carousel')
        } else {
        res.render('admin/edit-carousel-slide', {
            title: carousel.title,
            subtext: carousel.subtext,
            errors: errors,
            image: carousel.image,
            id: carousel._id
        });
      }
    });

});

/*
 * POST edit carousel slide
 */
router.post('/edit-carousel-slide/:id', function (req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('subtext', 'Subtext must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var subtext = req.body.subtext;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.render('admin/edit-carousel-slide', {
            errors: errors,
            title: title,
            subtext: subtext,
            id: id
        });
    } else {
        Carousel.findOne({slug: slug, _id: {'$ne': id}})
        .then((carousel)=>{
            if (carousel) {
                req.flash('danger', 'Carousel title exists, choose another.');
                res.render('admin/edit-carousel-slide', {
                    title: title,
                    subtext: subtext,
                    id: id
                });
            } else {
                Carousel.findById(id, function (err, carousel) {
                    if (err)
                        return console.log(err);

                    carousel.title = title;
                    carousel.slug = slug;

                    carousel.save(function (err) {
                        if (err)
                            return console.log(err);

                        Carousel.find(function (err, carousels) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.carousels = carousels;
                            }
                        });

                        req.flash('success', 'carousel edited!');
                        res.redirect('/admin/carousel/edit-carousel-slide/' + id);
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
    req.checkBody('subtext', 'Subtext must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var subtext = req.body.subtext;
    var id = req.params.id;
    var pimage = req.body.pimage;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.render('admin/edit-carousel-slide', {
            errors: errors,
            title: title,
            subtext: subtext,
            id: id
        });
    } else {
        Carousel.findOne({slug: slug, _id: {'$ne': id}})
        .then((carousel)=>{
            if (carousel) {
                req.flash('danger', 'Carousel title exists, choose another.');
                res.render('admin/edit-carousel-slide', {
                    title: title,
                    subtext: subtext,
                    id: id
                });
            } else {
                Carousel.findById(id, function (err, carousel) {
                    if (err)
                        return console.log(err);

                    carousel.title = title;
                    carousel.slug = slug;
                    if (imageFile != "") {
                        carousel.image = imageFile;
                    }
                    carousel.save(function (err) {
                        if (err)
                            return console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/carousel/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                        }
                    }

                        var carouselImage = req.files.image;
                        var path = 'public/carousel/' + id + '/' + imageFile;

                        carouselImage.mv(path, function (err) {
                            return console.log(err);
                        });

                        Carousel.find(function (err, carousels) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.carousels = carousels;
                            }
                        });

                        req.flash('success', 'carousel edited!');
                        res.redirect('/admin/carousel/edit-carousel-slide/' + id);
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
router.get('/delete-carousel-slide/:id',isAdmin, function (req, res) {
    var id = req.params.id;
    var path = 'public/carousel/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
        Carousel.findByIdAndRemove(id, function (err) {
            if (err)
                return console.log(err);

            Carousel.find({}).sort({sorting: 1}).exec(function (err, carousels) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.carousels = carousels;
                }
            });
        req.flash('success', 'Carousel deleted!');
        res.redirect('/admin/carousel/');
    })
    }   
})
});


// Exports
module.exports = router;


