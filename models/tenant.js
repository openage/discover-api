'use strict'
module.exports = {
    code: { type: String, required: true },
    name: String,
    key: String,
    config: Object,
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    }
}
