'use strict'
const mongoose = require('mongoose')

module.exports = {
    code: String,
    pic: {
        url: String,
        thumbnail: String,
        status: {
            type: String,
            default: 'active'
        }
    },

    images: [{
        url: String,
        thumbnail: String
    }],
    name: String,
    description: String,

    reactions: {
        like: Number,
        love: Number,
    },

    price: Number,

    entity: {
        id: String, // can be url in case of campaign
        provider: String, // rbc, directory
        type: { type: String }
    }, // person, hospital, shop, doctor, caregiver, campaign
    tags: [String], // electrician, accountant, heart (hospital)
    status: String,
    location: {
        coordinates: {
            type: {
                type: String, // Don't do `{ location: { type: String } }`
                enum: ['Point'], // 'location.type' must be 'Point'
                required: false,
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: false,
                default: [0, 0]
            }
        },
        name: String,
        description: String,
        line1: String,
        line2: String,
        district: String,
        city: String,
        state: String,
        pinCode: String,
        country: String
    },

    startTime: Date, // profile display startTime
    endTime: Date, // profile expiry time

    meta: Object,

    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'interest' }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],

    // superlike = like = true, status = outGoing
    // like = like = undefined/false, status = outGoing
    // bookmark = status = bookmarked
    // dislike = status = ignored
    // TODO: move it to separate model
    users: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        // mutual: active-active, blocked-outGoing, inComming-outGoing, outGoing-inComming
        // individual: ignored-*, bookmarked-*
        status: String,
        rating: Number,
        date: Date
    }],

    targets: [{
        field: String,
        op: String,
        value: Object
    }],

    rating: {
        value: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        oneStar: { type: Number, default: 0 },
        twoStar: { type: Number, default: 0 },
        threeStar: { type: Number, default: 0 },
        fourStar: { type: Number, default: 0 },
        fiveStar: { type: Number, default: 0 }
    },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'tenant' }
}
