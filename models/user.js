var mongoose = require('mongoose')

module.exports = {
    code: { type: String },

    profile: {
        age: Number,
        gender: String
    },

    role: {
        id: { type: String },
        code: { type: String },
        key: { type: String },
        permissions: [{ type: String }]
    },

    prefrences: {
        age: {
            start: Number,
            end: Number
        },
        gender: String
    },

    // TODO: part of social
    // // spread the word
    // facebookFriends: [String],
    // contactFriends: [String],
    // invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },

    // requests: [{
    //     status: String,
    //     role: String,
    //     recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    // }],

    lastSeen: { type: Date, default: Date.now },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
