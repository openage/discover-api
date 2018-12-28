'use strict'
var mongoose = require('mongoose')

module.exports = {
    name: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
