module.exports = {
    id: String,
    pic: {
        url: String,
        thumbnail: String
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
        thumbnail: String
    }],
    interests: [{
        id: String,
        name: String
    }],
    connections: [{
        id: String,
        status: String,
        date: Date,
        profile: {
            id: String,
            pic: {
                url: String,
                thumbnail: String
            },
            name: String,
            age: Number
        }
    }],
    connnectionStatus: String,
    status: String,
    lastSeen: Date,
    timeStamp: Date
}
