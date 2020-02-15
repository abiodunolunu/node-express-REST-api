const mongoose = require('mongoose')

const QuoteSchema = new mongoose.Schema({
    quote: {
        required: true,
        type: String
    },
    imageUrl: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    file: {
        type: Object
    }
}, { timestamps: true })

module.exports = mongoose.model('Quote', QuoteSchema)