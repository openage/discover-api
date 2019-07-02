/* eslint-disable indent */
'use strict'

// var fetchConnectionStatus = function (hisProfile, myProfileId, cb) {
//     _.find(hisProfile.connections, function (item) {
//         if (item.profile.toString() === myProfileId) {
//             if (item.status === 'inComming') {
//                 return cb(null, 'outGoing')
//             }
//             if (item.status === 'outGoing') {
//                 return cb(null, 'inComming')
//             }
//             return cb(null, item.status)
//         }
//     })
// }

exports.toModel = (entity) => {
    var model = {
        id: entity.id || entity._id.toString(),
        name: entity.name,
        description: entity.description,
        status: entity.status,
        about: entity.about,
        city: entity.city,
        state: entity.state,
        country: entity.country,
        startTime: entity.startTime,
        endTime: entity.endTime,
        meta: entity.meta,
        timeStamp: entity.timeStamp
    }

    if (entity.pic) {
        model.pic = {
            url: entity.pic.url,
            thumbnail: entity.pic.thumbnail,
            status: entity.pic.status || 'active'
        }
    }

    if (entity.location) {
        model.location = {
            name: entity.location.name,
            description: entity.location.description,
            coordinates: entity.location.coordinates
        }
    }

    model.interests = []

    if (entity.interests && entity.interests.length) {
        entity.interests.forEach(interest => {
            if (interest._doc) {
                model.interests.push({
                    id: interest.id,
                    name: interest.name
                })
            } else {
                model.interests.push({
                    id: interest.toString()
                })
            }
        })
    }

    return model
}

exports.toMyProfileModel = function (entity) {
    var model = mapper.toModel(entity)
    model.status = entity.status
    model.connections = []

    if (entity.connections && entity.connections.length) {
        entity.connections.forEach(connection => {
            model.connections.push({
                id: connection.id.toString(),
                status: connection.status,
                date: connection.date,
                profile: {
                    id: connection.profile.toString()
                }
            })
        })
    }

    if (entity.location) {
        model.location = {
            name: entity.location.name,
            description: entity.location.description,
            coordinates: []
        }

        if (entity.location.coordinates && entity.location.coordinates.length) {
            entity.location.coordinates.forEach(item => {
                model.location.coordinates.push(item)
            })
        }
    }

    if (entity.preferences) {
        model.preferences = {
            id: entity.preferences.id.toString(),
            seenBy: entity.preferences.seenBy,
            showAge: entity.preferences.showAge
        }
        if (entity.preferences.lookingFor) {
            model.preferences.lookingFor = {}

            if (entity.preferences.lookingFor.age) {
                model.preferences.lookingFor.age = {
                    start: entity.preferences.lookingFor.age.start ? entity.preferences.lookingFor.age.start : 0,
                    end: entity.preferences.lookingFor.age.end ? entity.preferences.lookingFor.age.end : 0
                }
            }
            if (entity.preferences.lookingFor.gender) {
                model.preferences.lookingFor.gender = entity.preferences.lookingFor.gender
            }
        }
    }
    return model
}

exports.toSearchModel = function (entities) {
    return entities.map((entity) => {
        return exports.toModel(entity)
    })
}

// mapper.discoverProfiles = function (entities, myProfileId) {
//     var profiles = []
//     _.each(entities, function (item) {
//         var profileModel = {
//             id: item.id,
//             picUrl: item.picUrl,
//             picData: item.picData,
//             name: item.name
//         }
//         fetchConnectionStatus(item, myProfileId, function (err, data) {
//             if (err) {
//                 return null
//             }
//             profileModel.myConnectionStatus = data || null
//         })
//         profileModel.myConnectionStatus = profileModel.myConnectionStatus ? profileModel.myConnectionStatus : null
//         profiles.push(profileModel)
//     })
//     return profiles
// }
