module.exports = {
    id: String,
    pic: {
        url: String,
        thumbnail: String,
        status: String
    },
    name: String,
    age: Number,
    gender: String,
    about: String,
    location: {
        name: String,
        description: String,
        coordinates: [Number]
    },
    images: [{
        order: Number,
        url: String,
        thumbnail: String,
        status: String
    }],
    preferences: {
        showAge: Boolean,
        seenBy: String,
        lookingFor: {
            age: {
                start: Number,
                end: Number
            },
            gender: String
        }
    },
    interests: [{
        id: String,
        name: String
    }],
    connections: [{
        status: String,
        like: Boolean,
        date: Date,
        profile: {
            id: String
            // ,
            // pic: {
            //     url: String,
            //     thumbnail: String
            // },
            // name: String,
            // age: Number
        }
    }],
    connnectionStatus: String,
    status: String,
    lastSeen: Date,
    timeStamp: Date
}