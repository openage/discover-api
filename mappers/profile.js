'use strict'

const categoryMapper = require('./category')
const interestMapper = require('./interest')

exports.toModel = (entity, context) => {
    if (!entity) {
        return
    }

    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }

    var model = {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        description: entity.description,
        status: entity.status,
        // city: entity.city,
        // state: entity.state,
        // country: entity.country,
        startTime: entity.startTime,
        endTime: entity.endTime,
        meta: entity.meta,
        price: entity.price,
        tags: entity.tags,
        interests: [],
        categories: [],
        targets: [],
        timeStamp: entity.timeStamp
    }

    if (entity.pic) {
        model.pic = {
            url: entity.pic.url,
            thumbnail: entity.pic.thumbnail,
            status: entity.pic.status || 'active'
        }
    }

    if (entity.entity) {
        model.entity = {
            id: entity.entity.id,
            type: entity.entity.type,
            provider: entity.entity.provider
        }
    }

    if (entity.entity) {
        model.rating = {
            value: entity.rating.value,
            count: entity.rating.count,
            reviewCount: entity.rating.reviewCount,
            oneStar: entity.rating.oneStar,
            twoStar: entity.rating.twoStar,
            threeStar: entity.rating.threeStar,
            fourStar: entity.rating.fourStar,
            fiveStar: entity.rating.fiveStar
        }
    }
    
    if (entity.reactions) {
        model.reactions = {
            like: entity.reactions.like || 0,
            love: entity.reactions.love || 0
        }
    }

    if (entity.location) {
        model.location = {
            name: entity.location.name,
            description: entity.location.description,
            line1: entity.location.line1,
            line2: entity.location.line2,
            district: entity.location.district,
            city: entity.location.city,
            state: entity.location.state,
            pinCode: entity.location.pinCode,
            country: entity.location.country
        }
        if (entity.location.coordinates && entity.location.coordinates.coordinates && entity.location.coordinates.coordinates.length == 2) {
            model.location.lat = entity.location.coordinates.coordinates[0]
            model.location.long = entity.location.coordinates.coordinates[1]
        }
    }

    if (entity.interests && entity.interests.length) {
        model.interests = entity.interests.map(i => interestMapper.toModel(i, context))
    }

    if (entity.categories && entity.categories.length) {
        model.categories = entity.categories.map(i => categoryMapper.toModel(i, context))
    }

    if (entity.targets && entity.targets.length) {
        model.targets = entity.targets.map(i => {
            return {
                field: i.field,
                op: i.op || 'eq',
                value: i.value
            }
        })
    }

    if (context.user) {
        let relation = entity.users.find(i => i.user.toString() === context.user.id)

        if (relation) {
            model.relation = {
                date: relation.date,
                status: relation.status,
                rating: relation.rating
            }
        }
    }

    return model
}

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

// exports.toMyProfileModel = function (entity) {
//     var model = mapper.toModel(entity)
//     model.status = entity.status
//     model.connections = []

//     if (entity.connections && entity.connections.length) {
//         entity.connections.forEach(connection => {
//             model.connections.push({
//                 id: connection.id.toString(),
//                 status: connection.status,
//                 date: connection.date,
//                 profile: {
//                     id: connection.profile.toString()
//                 }
//             })
//         })
//     }

//     if (entity.location) {
//         model.location = {
//             name: entity.location.name,
//             description: entity.location.description,
//             coordinates: []
//         }

//         if (entity.location.coordinates && entity.location.coordinates.length) {
//             entity.location.coordinates.forEach(item => {
//                 model.location.coordinates.push(item)
//             })
//         }
//     }

//     if (entity.preferences) {
//         model.preferences = {
//             id: entity.preferences.id.toString(),
//             seenBy: entity.preferences.seenBy,
//             showAge: entity.preferences.showAge
//         }
//         if (entity.preferences.lookingFor) {
//             model.preferences.lookingFor = {}

//             if (entity.preferences.lookingFor.age) {
//                 model.preferences.lookingFor.age = {
//                     start: entity.preferences.lookingFor.age.start ? entity.preferences.lookingFor.age.start : 0,
//                     end: entity.preferences.lookingFor.age.end ? entity.preferences.lookingFor.age.end : 0
//                 }
//             }
//             if (entity.preferences.lookingFor.gender) {
//                 model.preferences.lookingFor.gender = entity.preferences.lookingFor.gender
//             }
//         }
//     }
//     return model
// }

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
