'use strict'
var mongoose = require('mongoose')

module.exports = {
    pic: {
        url: String,
        thumbnail: String,
        status: {
            type: String,
            default: 'active'
        }
    },
    name: String,
    description: String,

    entity: {
        id: String,
        type: { type: String }
    }, // person, hosptial, shop, doctor

    status: String,
    location: {
        coordinates: {
            type: [Number], // [<longitude>, <latitude>]
            index: '2dsphere' // create the geospatial index
        },
        name: String,
        description: String
    },

    city: String,
    state: String,
    country: String,

    startTime: Date, // profile display startTime
    endTime: Date,   // profile expiry time

    meta: Object,

    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'interest' }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],

    // superlike = like = true, status = outGoing
    // like = like = undefined/false, status = outGoing
    // bookmark = status = bookmarked
    // dislike = status = ignored
    users: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        // mutual: active-active, blocked-outGoing, inComming-outGoing, outGoing-inComming
        // individual: ignored-*, bookmarked-*
        status: String,
        like: Boolean,
        date: Date
    }],

    userAttributes: [{
        field: String,
        op: String,
        value: Object
    }],

    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
