var express = require('express');
var axios = require('axios');
var auth = require('../config/auth');
var router = express.Router();

// Get Page model
var Page = require('../models/pageModel');

// Get Product model
var Product = require('../models/productModel');

// Get Category Model
var Category = require('../models/categoryModel');

/*
 * GET /
 */
router.get('/', (req, res) => {
        //Get all pages 
        Page.findOne({slug: 'home'})
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

                //Get categorised product lengths
                let product_lengths = [];
                req.app.locals.categories.forEach(function(c){
                Product.countDocuments({category: c.slug}, function (err, product_count) {
                if (err)
                    console.log(err);
                product_lengths.push({'category': c.slug, 'length': product_count});
                req.app.locals.product_lengths = product_lengths;
            });
        })
        }
        });

        res.render('index', {
            title: page.title,
            content: page.content
        });        
    })
    .catch((err)=>{
        console.log(err);
    })
});

/*
 * GET a page
 */
router.get('/:slug', async (req, res) => {

    var slug = req.params.slug;

    Page.findOne({slug: slug})
    .then((page)=>{
        if(!page || page.slug == 'home' || page.slug == 'checkout') {
            res.render('404');
        } else {
            res.render(page.slug, {
                title: page.title,
                content: page.content
            });
        }
    })
    .catch((err)=>{
        console.log(err);
    })
});

router.post('/currency', async (req, res)=>{
    var currency = req.body.currency;
    req.app.locals.currency = currency;

    const options = {
        method: 'GET',
        url: 'https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency',
        params: {
          have: 'USD',
          want: currency,
          amount: 1
        },
        headers: {
          'content-type': 'application/octet-stream',
          'X-RapidAPI-Key': '42581eca8dmsh541d5df5b68dd5fp173007jsn31b2b6196b7c',
          'X-RapidAPI-Host': 'currency-converter-by-api-ninjas.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
          req.app.locals.exrate = response.data.new_amount;

          // on success go to home
          Page.findOne({slug: 'home'})
          .then((page)=>{
      
              Product.find(function (err, products) {
                  if (err){
                      console.log(err);
                      } else { 
                      req.app.locals.products = products;  
                }
              })
      
              res.render('index', {
                  title: page.title,
                  content: page.content,
                  user: req.user || null
              });
          })
          .catch((err)=>{
              console.log(err);
          })

      } catch (error) {
          console.error(error);
      }
})


router.get('/search/:key', async function(req, res){
    let data = await Product.find(
        {
            "$or":[
                {title: {$regex: req.params.key}},
                {slug: {$regex: req.params.key}},
                {desc_short: {$regex: req.params.key}},
                {desc: {$regex: req.params.key}},
                {category: {$regex: req.params.key}},
            ]
        }
    );

    console.log(data);
    res.render('search', {
        title: 'search',
        results: data,
    })
});

// Exports
module.exports = router;
