const mongoose = require('mongoose')

module.exports = {
    role: {
        id: String,
        key: String,
        code: String,
        permissions: [{
            type: String
        }]
    },
    email: String,
    phone: String,
    code: String,
    profile: {
        firstName: String,
        lastName: String,
        gender: String,
        dob: Date,
        pic: {
            url: String,
            thumbnail: String
        }
    },
    config: Object,
    preferences: {
        age: {
            start: Number,
            end: Number
        },
        gender: String,
        coordinates: {
            type: [Number]
        },
        interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'interest' }]
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

    status: String,
    lastSeen: Date,

    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
