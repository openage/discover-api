module.exports = {
    id: String,

    connection: {
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
    },
    lastSeen: Date,
    timeStamp: Date
}
