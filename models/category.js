'use strict'

var mongoose = require('mongoose')
module.exports = {
    name: String,
    pic: {
        url: String,
        thumbnail: String
    },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
