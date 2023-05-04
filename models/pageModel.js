const mongoose = require('mongoose');

const PageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now()
      }   
})

const Page = module.exports = mongoose.model('Page', PageSchema);