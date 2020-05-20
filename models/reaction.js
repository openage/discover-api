'use strict'

const mongoose = require('mongoose')

module.exports = {
    type: {
        type: String,
        default: 'like',
        enum: ['like', 'love']
    },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'profile' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
