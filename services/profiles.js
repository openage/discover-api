'use strict'

const db = require('../models')

const interestService = require('./interests')
const preferenceService = require('./preferences')
exports.create = async (model, context) => {
    model.tenant = context.tenant
    let profile = new db.profile(model)

    return profile.save()
}

exports.update = async (id, model, context) => {
    const entity = await db.profile.findById(id).populate('interests preferences')
    if (model.interests && model.interests.length) {
        entity.interests = []

        for (const interest of model.interests) {
            entity.interests.push(await interestService.get(interest))
        }
    }
    if (model.preferences) {
        let preferences = await preferenceService.get({
            profile: {
                id: context.profile.id
            },
            preferences: model.preferences
        }, context)
        if (preferences) {
            entity.preferences = await preferenceService.update(model.preferences, preferences, context)
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

const extractQuery = (params, context) => {
    let where = {
        tenant: toObjectId(context.tenant.id)
    }

    where.status = { $eq: 'active' }

    if (!params) { return where }

    for (let key in params) {
        if (key.toLowerCase().startsWith('sort') || key == 'limit' || key == 'skip') {
            continue
        }

        let value = params[key]

        if (!value) { continue }

        let operator = value.includes(':') ? ('$' + value.split(':')[0]) : '$eq'

        key = key.replace('/_/gi', '.')

        if (where.hasOwnProperty(key)) {
            where[key][operator] = value
        } else {
            where[key] = new Object()
            where[key][operator] = value
        }

    }

    // let interests = params.interests || context.getConfig('interests')
    // if (interests) {
    //     where.interests = {
    //         $all: interests
    //     }
    // }

    // if (context.config) {
    //     if (context.config.lookingFor) {
    //         if (context.config.lookingFor.gender) {
    //             where['gender'] = context.config.lookingFor.gender
    //         }
    //         if (context.config.lookingFor.age) {
    //             if (context.config.lookingFor.age.start) {
    //                 where['age'] = {
    //                     $gte: context.config.lookingFor.age.start
    //                 }
    //             }
    //             if (context.config.lookingFor.age.end) {
    //                 where['age'] = {
    //                     $lte: context.config.lookingFor.age.end
    //                 }
    //             }
    //         }
    //     }
    // }

    // if (params.around && context.profile.location && context.profile.location.coordinates) {
    //     where['location.coordinates'] = {
    //         $geoWithin: {
    //             $centerSphere: [context.profile.location.coordinates, Number(params.around) / 3963.2]
    //         }
    //     }
    // }
    return where
}

exports.discover = async (query, page, context) => {
    let where = extractQuery(query, context)
    let finder = [{
        $match: where
    }]
    context.logger.debug('query', where)

    let profiles = await db.profile.aggregate(finder)

    let count = await db.profile.find(where).count()

    return {
        items: profiles,
        count: count
    }
}

exports.get = async (id, context) => {
    let entity = await db.profile.findById(id).populate('interests preferences')

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

const getByEntity = async (entity, context) => {
    if (!entity || !entity.id) { return }

    return db.profile.findOne({
        'entity.id': entity.id,
        'entity.type': entity.type
    })
}

exports.getByEntity = getByEntity
