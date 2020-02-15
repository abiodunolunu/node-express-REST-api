const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        required: true,
        type: String
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'I am new!'
    },
    quotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote'
    }]
});

module.exports = mongoose.model('User', UserSchema)