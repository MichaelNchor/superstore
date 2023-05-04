var mongoose = require('mongoose');

// Category Schema
var CompanySchema = mongoose.Schema({
   
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

var Company = module.exports = mongoose.model('Company', CompanySchema);

