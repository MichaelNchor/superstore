var mongoose = require('mongoose');

// Product Schema
var ProductSchema = mongoose.Schema({
   
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc_short: {
        type: String,
        required: true 
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
    },
    numberOfRatings: {
        type: Number,
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
      }   
});

var Product = module.exports = mongoose.model('Product', ProductSchema);

