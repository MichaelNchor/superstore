var mongoose = require('mongoose');

// Category Schema
var ReviewSchema = mongoose.Schema({
    
    rating: {
        type: String,
        required: true
    },    
    message: {
        type: String,
    },     
    user: {
        type: String,
        required: true
    },
    product: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    } 
    
});

var Review = module.exports = mongoose.model('Review', ReviewSchema);

