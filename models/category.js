'use strict'

const mongoose = require('mongoose')

module.exports = {
    code: String,
    name: String,
    entityId: String,
    pic: {
        url: String,
        thumbnail: String
    },
    status: String,
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
