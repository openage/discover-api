'use strict'
const mongoose = require('mongoose')

module.exports = {
    name: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    status: String,
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
