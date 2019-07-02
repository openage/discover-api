'use strict'
var mongoose = require('mongoose')

module.exports = {
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'profile' },
    showAge: {
        type: Boolean,
        default: true
    },
    seenBy: {
        type: String,
        default: 'all',
        enum: ['all', 'gold']
    }

}
