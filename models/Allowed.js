const mongoose = require('mongoose');

const AllowedEmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Ensure each email is unique per user

const AllowedEmail = mongoose.model('AllowedEmail', AllowedEmailSchema);

module.exports = AllowedEmail;
