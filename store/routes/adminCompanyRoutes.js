var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Category model
var Company = require('../models/companyModel');

/*
 * GET pages index
 */
router.get('/',isAdmin, function (req, res) {
    Company.find({}).sort({sorting: 1}).exec(function (err, companys) {
        if (err)
            return console.log(err);
        res.render('admin/company', {
            companys: companys
        });
    });
});

/*
 * GET add product
 */
router.get('/add-company-slide',isAdmin, function (req, res) {

    var title = "";

    res.render('admin/add-company-slide', {
        title: title,
    });
});

/*
 * POST add product
 */
router.post('/add-company-slide', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add-company-slide', {
            errors: errors,
            title: title,
            slug: slug,
        });
    } else {
        Company.findOne({slug: slug})
        .then((company)=>{
            if (company) {
                req.flash('danger', 'Slide title exists, choose another.');
                    res.render('admin/add-company-slide', {
                        title: title,
                        slug: slug,
                    });
            } else {

            var company = new Company({
                title: title,
                slug: slug,
                image: imageFile,
                sorting: 100,
            });

            company.save(async function (err) {
                if (err) return console.log(err);

                await mkdirp('public/company/' + company._id)
                .then(() => console.log('successfully added!'))
                .catch((err) => console.log(err))

                
                if (imageFile != "") {
                    var companyImage = req.files.image;
                    var path = 'public/company/' + company._id + '/' + imageFile;
                    console.log(companyImage)
                    console.log(path)
                    companyImage.mv(path, function(err){
                        if(err) console.log(err)
                        else console.log('successfully moved!');
                    });
                }

                req.flash('success', 'Category added!');
                res.redirect('/admin/company');
            });
            }
        })
        .catch((err)=>{
            console.log(err)
        })
    }
});

// Sort pages function
function sortCompany(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Company.findById(id, function (err, company) {
                company.sorting = count;
                company.save(function (err) {
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
 * POST reorder company slide
 */
router.post('/reorder-company-slide', function (req, res) {
    var ids = req.body['id[]'];

    sortCompany(ids, function () {
        Company.find({}).sort({sorting: 1}).exec(function (err, companys) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.companys = companys;
            }
        });
    });

});

/*
 * GET edit company slide
 */
router.get('/edit-company-slide/:id',isAdmin, function (req, res) {
    var errors;
    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Company.findById(req.params.id, function (err, company) {
        if (err){
            console.log(err);
            res.redirect('/admin/company')
        } else {
        res.render('admin/edit-company-slide', {
            title: company.title,
            errors: errors,
            image: company.image,
            id: company._id
        });
      }
    });

});

/*
 * POST edit company slide
 */
router.post('/edit-company-slide/:id', function (req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {

        req.checkBody('title', 'Title must have a value.').notEmpty();
    
        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();
        var id = req.params.id;
    
        var errors = req.validationErrors();
    
        if (errors) {
            req.session.errors = errors;
            res.render('admin/edit-company-slide', {
                errors: errors,
                title: title,
                id: id
            });
        } else {
            Company.findOne({slug: slug, _id: {'$ne': id}})
            .then((company)=>{
                if (company) {
                    req.flash('danger', 'Company title exists, choose another.');
                    res.render('admin/edit-company-slide', {
                        title: title,
                        id: id
                    });
                } else {
                    Company.findById(id, function (err, company) {
                        if (err)
                            return console.log(err);
    
                        company.title = title;
                        company.slug = slug;

                        company.save(function (err) {
                            if (err)
                                return console.log(err);
    
                            Company.find(function (err, companys) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    req.app.locals.companys = companys;
                                }
                            });
    
                            req.flash('success', 'company edited!');
                            res.redirect('/admin/company/edit-company-slide/' + id);
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
        res.render('admin/edit-company-slide', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Company.findOne({slug: slug, _id: {'$ne': id}})
        .then((company)=>{
            if (company) {
                req.flash('danger', 'Company title exists, choose another.');
                res.render('admin/edit-company-slide', {
                    title: title,
                    id: id
                });
            } else {
                Company.findById(id, function (err, company) {
                    if (err)
                        return console.log(err);

                    company.title = title;
                    company.slug = slug;
                    if (imageFile != "") {
                        company.image = imageFile;
                    }
                    company.save(function (err) {
                        if (err)
                            return console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/company/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                        }
                    }

                        var companyImage = req.files.image;
                        var path = 'public/company/' + id + '/' + imageFile;

                        companyImage.mv(path, function (err) {
                            return console.log(err);
                        });

                        Company.find(function (err, companys) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.companys = companys;
                            }
                        });

                        req.flash('success', 'company edited!');
                        res.redirect('/admin/company/edit-company-slide/' + id);
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
router.get('/delete-company-slide/:id',isAdmin, function (req, res) {
    var id = req.params.id;
    var path = 'public/company/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
        Company.findByIdAndRemove(id, function (err) {
            if (err)
                return console.log(err);

            Company.find({}).sort({sorting: 1}).exec(function (err, companys) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.companys = companys;
                }
            });
        req.flash('success', 'Company deleted!');
        res.redirect('/admin/company/');
    })
    }   
})
});


// Exports
module.exports = router;


