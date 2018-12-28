'use strict'

const db = require('../models')

const interestService = require('./interests')

exports.create = async (model, context) => {
    model.tenant = context.tenant
    let profile = new db.profile(model)

    return profile.save()
}

exports.update = async (id, model, context) => {
    const entity = await db.profile.findById(id).populate('interests')
    if (model.interests && model.interests.length) {
        entity.interests = []

        for (const interest of model.interests) {
            entity.interests.push(await interestService.get(interest))
        }
    }

    if (model.images && model.images.length) {
        for (const image of model.images) {
            let existing = entity.images.find(item => item.url.toLowerCase() === image.url.toLowerCase())
            if (existing) {
                existing.status = image.status
            } else {
                entity.images.push(image)
            }
        }
    }

    // if ( model.categories ) {
    //     if ( typeof ( model.categories[0] ) === 'object' ) {
    //         model.categories = _.pluck( model.categories, 'id' )
    //     }
    // }

    if (model.name && model.name !== entity.name) {
        entity.name = model.name
    }

    if (model.pic) {
        entity.pic = model.pic
    }

    if (model.status && model.status !== entity.status) {
        entity.status = model.status
    }

    if (model.age && model.age !== entity.age) {
        entity.age = model.age
    }

    if (model.gender && model.gender !== entity.gender) {
        entity.gender = model.gender
    }

    if (model.about && model.about !== entity.about) {
        entity.about = model.about
    }

    if (model.location && model.location !== entity.location) {
        entity.location = model.location
    }

    return entity.save()
}

exports.discover = async (query, context) => {
    var where = {}

    where.status = {
        $eq: 'active'
    }

    where._id = {
        $ne: context.profile.id,
        $nin: context.profile.connections.filter(item => item.status === 'active').map(item => item.profile)
    }

    // var name = query.name

    if (query.interests) {
        where.interests = {
            $all: query.interests
        }
    }

    if (query.around && context.profile.location && context.profile.location.coordinates) {
        where['location.coordinates'] = {
            $geoWithin: {
                $centerSphere: [context.profile.location.coordinates, Number(query.around) / 3963.2]
            }
        }
    }

    context.logger.debug('query', where)

    let profiles = await db.profile.find(where)

    profiles.forEach(item => {
        item.connnectionStatus = getConnectionStatus(item, context)
    })

    return profiles
}

exports.get = async (id, context) => {
    let entity = await db.profile.findById(id).populate('interests')

    if (context.profile.id !== id) {
        entity.connnectionStatus = getConnectionStatus(entity, context)
    }

    return entity
}

var getConnectionStatus = (profile, context) => {
    let connnection = profile.connections.find(item => item.profile.toString() === context.profile.id)

    if (!connnection) {
        return ''
    }
    if (connnection.status === 'inComming') {
        return 'outGoing'
    }
    if (connnection.status === 'outGoing') {
        return 'inComming'
    }

    return connnection.status
}
