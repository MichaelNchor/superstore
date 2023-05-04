var mongoose = require('mongoose');

// Category Schema
var CarouselSchema = mongoose.Schema({
   
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    subtext: {
        type: String
    },
    image: {
        type: String
    },    
    sorting: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }    
    
});

var Carousel = module.exports = mongoose.model('Carousel', CarouselSchema);

