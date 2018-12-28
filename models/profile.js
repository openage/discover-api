'use strict'
var mongoose = require('mongoose')

module.exports = {
    pic: {
        url: String,
        thumbnail: String
    },
    name: String,
    age: Number,
    gender: String,
    about: String,
    status: String,

    role: {
        id: { type: String },
        key: { type: String },
        permissions: [{ type: String }]
    },

    location: {
        coordinates: {
            type: [Number], // [<longitude>, <latitude>]
            index: '2dsphere' // create the geospatial index
        },
        name: String,
        description: String
    },
    images: [{
        order: Number,
        url: String,
        thumbnail: String,
        status: String
    }],
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'interest' }],

    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],

    connections: [{
        profile: { type: mongoose.Schema.Types.ObjectId, ref: 'profile' },
        status: String, // active, blocked, inComming, outGoing, ignored
        date: Date
    }],

    requests: [{
        status: String,
        role: String,
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'profile' }
    }],

    // spread the word
    facebookFriends: [String],
    contactFriends: [String],
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'profile' },

    lastSeen: { type: Date, default: Date.now },

    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
