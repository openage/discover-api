'use strict'
var _ = require('underscore')

var mapper = exports
var profileId

var fetchConnectionStatus = function (hisProfile, myProfileId, cb) {
    _.find(hisProfile.connections, function (item) {
        if (item.profile.toString() === myProfileId) {
            if (item.status === 'inComming') {
                return cb(null, 'outGoing')
            }
            if (item.status === 'outGoing') {
                return cb(null, 'inComming')
            }
            return cb(null, item.status)
        }
    })
}

mapper.toModel = (entity) => {
    var model = {
        id: entity.id,
        name: entity.name,
        age: entity.age,
        gender: entity.gender,
        about: entity.about,
        connnectionStatus: entity.connnectionStatus,
        lastSeen: entity.lastSeen,
        timeStamp: entity.timeStamp
    }

    if (entity.pic) {
        model.pic = {
            url: entity.pic.url,
            thumbnail: entity.pic.thumbnail
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
    model.images = []

    if (entity.images && entity.images.length) {
        entity.images.forEach(image => {
            if (!image.status || image.status !== 'deleted') {
                model.images.push({
                    order: image.order,
                    url: image.url,
                    thumbnail: image.thumbnail
                })
            }
        })
    }

    return model
}

mapper.toMyProfileModel = function (entity) {
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

    return model
}

mapper.toSearchModel = function (entities, id) {
    if (id) {
        profileId = id
    }
    return _(entities).map(mapper.toModel)
}

mapper.discoverProfiles = function (entities, myProfileId) {
    var profiles = []
    _.each(entities, function (item) {
        var profileModel = {
            id: item.id,
            picUrl: item.picUrl,
            picData: item.picData,
            name: item.name
        }
        fetchConnectionStatus(item, myProfileId, function (err, data) {
            if (err) {
                return null
            }
            profileModel.myConnectionStatus = data || null
        })
        profileModel.myConnectionStatus = profileModel.myConnectionStatus ? profileModel.myConnectionStatus : null
        profiles.push(profileModel)
    })
    return profiles
}
