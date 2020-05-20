'use strict'

const db = require('../models')

const interests = require('./interests')
const categories = require('./categories')
// const preferenceService = require('./preferences')

const populate = 'interests categories'

const set = async (model, entity, context) => {
    if (model.code && model.code !== entity.code) {
        if (await this.get(model.code, context)) {
            throw new Error(`${model.code} already exists`)
        }
        entity.code = model.code.toLowerCase()
    }

    if (model.name && model.name !== entity.name) {
        entity.name = model.name
    }

    if (model.description) {
        entity.description = model.description
    }

    if (model.price) {
        entity.price = model.price
    }

    if (model.meta && model.meta !== entity.meta) {
        entity.meta = model.meta
    }

    if (model.pic) {
        entity.pic = model.pic
    }

    if (model.status && model.status !== entity.status) {
        entity.status = model.status
    }

    if (model.tags && model.tags[0]) {
        entity.tags = []
        model.tags.forEach(tag => {
            entity.tags.push(tag.toString())
        })
    }

    if (model.interests && model.interests.length) {
        entity.interests = []

        for (const interest of model.interests) {
            entity.interests.push(await interests.get(interest, context))
        }
    }

    if (model.categories && model.categories.length) {
        entity.categories = []
        for (const category of model.categories) {
            let item = await categories.get(category, context)
            if (!item) {
                item = await categories.create(category, context)
            }
            entity.categories.push(item)
        }
    }

    // if (model.preferences) {
    //     let preferences = await preferenceService.get({
    //         profile: {
    //             id: context.profile.id
    //         },
    //         preferences: model.preferences
    //     }, context)
    //     if (preferences) {
    //         entity.preferences = await preferenceService.update(model.preferences, preferences, context)
    //     }
    // }

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

    if (model.targets && model.targets.length) {
        entity.targets = model.targets.map(i => {
            return {
                field: i.field,
                op: i.op || 'eq',
                value: i.value
            }
        })
    }

    if (model.rating) {
        entity.rating = {
            value: model.rating.value,
            count: model.rating.count,
            reviewCount: model.rating.reviewCount,
            oneStar: model.rating.oneStar,
            twoStar: model.rating.twoStar,
            threeStar: model.rating.threeStar,
            fourStar: model.rating.fourStar,
            fiveStar: model.rating.fiveStar
        }
    }

    if (model.location) {
        entity.location = {
            name: model.location.name,
            description: model.location.description,
            line1: model.location.line1,
            line2: model.location.line2,
            district: model.location.district,
            city: model.location.city,
            state: model.location.state,
            pinCode: model.location.pinCode,
            country: model.location.country
        }
        if (model.location.lat && model.location.long) {
            let coordinates = {
                coordinates: [Number(model.location.lat), Number(model.location.long)],
                type: 'Point'
            }
            entity.location.coordinates = coordinates
        }
    }
}

exports.create = async (model, context) => {
    if (!model.entity || !model.entity.id || !model.entity.type) {
        throw new Error('entity is required')
    }

    let entity = await this.get(model, context)

    if (!entity) {
        if (!model.code) {
            model.code = `${model.entity.type}-${model.entity.id}`
        }

        entity = new db.profile({
            entity: model.entity,
            status: 'active',
            owner: context.user,
            tenant: context.tenant
        })
    }

    await set(model, entity, context)
    return entity.save()
}

exports.react = async (model, context) => {

    if (!model.profile) {
        throw new Error('profile is required')
    }

    const entity = await this.get(model.profile, context)

    entity.reactions = entity.reactions || {}

    let reaction = await db.reaction.findOne({
        profile: entity,
        user: context.user,
        tenant: context.tenant
    })

    if (reaction) {
        if (entity.reactions[reaction.type]) {
            entity.reactions[reaction.type]--
        } else {
            entity.reactions[reaction.type] = 0
        }
        reaction.type = model.type || 'like'
    } else {
        reaction = new db.reaction({
            type: model.type || 'like',
            profile: entity,
            user: context.user,
            tenant: context.tenant
        })
    }

    await reaction.save()

    if (entity.reactions[reaction.type]) {
        entity.reactions[reaction.type]++
    } else {
        entity.reactions[reaction.type] = 1
    }

    return entity.save()
}

exports.update = async (id, model, context) => {
    const entity = await this.get(id, context)

    await set(model, entity, context)
    return entity.save()
}

exports.search = async (query, paging, context) => {
    let log = context.logger.start('services/profile:search')

    let where = {
        tenant: context.tenant
    }

    where.status = { $eq: 'active' }

    // for (let key in params) {
    //     if (key.toLowerCase().startsWith('sort') || key == 'limit' || key == 'skip') {
    //         continue
    //     }

    //     let value = params[key]

    //     if (!value) { continue }

    //     let operator = value.includes(':') ? ('$' + value.split(':')[0]) : '$eq'

    //     key = key.replace('/_/gi', '.')

    //     if (where.hasOwnProperty(key)) {
    //         where[key][operator] = value
    //     } else {
    //         where[key] = new Object()
    //         where[key][operator] = value
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

    if (query.around) {
        let coordinates
        if (query.lat && query.long) {
            coordinates = [query.lat, query.long]
        } else if (context.user && context.user.preferences && context.user.preferences.coordinates && context.user.preferences.coordinates.length) {
            coordinates = context.user.preferences.coordinates
        }
        if (coordinates) {
            where['location.coordinates'] = {
                $near:
                {
                    $geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    $maxDistance: query.around
                }
            }
        }
    }

    if (query.entity) {
        if (query.entity.id) {
            where['entity.id'] = query.entity.id
        }

        if (query.entity.type) {
            where['entity.type'] = query.entity.type
        }
    }

    if (query.tag) {
        where.tags = {
            $regex: '^' + query.tag,
            $options: 'i'
        }
    }

    if (query.category) {
        where.categories = { $in: await (await categories.search(query.category, null, context)).items }
    }

    if (query.name) {
        where.name = {
            $regex: '^' + query.name,
            $options: 'i'
        }
    }

    if (query.address) {
        where['$or'] = [
            {
                line1: {
                    $regex: query.address,
                    $options: 'i'
                }
            }, {
                line2: {
                    $regex: query.address,
                    $options: 'i'
                }
            }, {
                district: {
                    $regex: query.address,
                    $options: 'i'
                }
            }, {
                city: {
                    $regex: query.address,
                    $options: 'i'
                }
            }, {
                state: {
                    $regex: query.address,
                    $options: 'i'
                }
            }, {
                country: {
                    $regex: query.address,
                    $options: 'i'
                }
            }, {
                pinCode: {
                    $regex: query.address,
                    $options: 'i'
                }
            }
        ]
    }

    // let interests = query.interests
    // if (!interests && context.user.preferences.interests && context.user.preferences.interests.length) {
    //     interests = context.user.preferences.interests
    // }
    // if (interests) {
    //     where.interests = {
    //         $all: interests
    //     }
    // }

    let items = await db.profile.find(where).populate(populate)

    let count = await db.profile.find(where).count()

    log.end()
    return {
        items: items,
        count: count
    }
}

exports.get = async (query, context) => {
    context.logger.start('services/profiles:get')
    let where = {
        tenant: context.tenant
    }
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.profile.findById(query).populate(populate)
        } else {
            where.code = query.toLowerCase()
            return db.profile.findOne(where).populate(populate)
        }
    }

    if (query.id) {
        return db.profile.findById(query.id).populate(populate)
    }

    if (query.code) {
        where.code = query.code.toLowerCase()
        return db.profile.findOne(where).populate(populate)
    }

    if (query.entity && query.entity.id && query.entity.type) {
        where['entity.id'] = query.entity.id.toString().toLowerCase()
        where['entity.type'] = query.entity.type.toString().toLowerCase()
        return db.profile.findOne(where).populate(populate)
    }
}

exports.my = async (id, model, context) => {
    let entity = await this.get(id, context)

    let my = entity.users.find(i => i.user.toString() === context.user.id)

    if (!my) {
        my = {
            user: context.user
        }

        entity.users.push(my)
    }

    my.status = model.status
    my.rating = model.rating
    my.date = new Date()

    await entity.save()

    return my
}
