var mongoose = require('mongoose');

// Category Schema
var CategorySchema = mongoose.Schema({
   
    title: {
        type: String,
        required: true
    },
    slug: {
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

var Category = module.exports = mongoose.model('Category', CategorySchema);

