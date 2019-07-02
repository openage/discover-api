'use strict'

const db = require('../models')

const create = async (model, context) => {
    let log = context.logger.start('services/preferences:create')

    let preference = await db.preference.findOne({
        profile: context.profile.id
    })

    if (!preference) {
        preference = await new db.preference({
            profile: context.profile.id,
            seenBy: model.seenBy,
            showAge: model.showAge,
            lookingFor: {
                age: {
                    start: model.lookingFor.age.start,
                    end: model.lookingFor.age.end
                },
                gender: model.lookingFor.gender
            }
        }).save()
    }

    log.end()

    return preference
}

const update = async (model, entity, context) => {
    context.logger.debug('services/preferences:update')
    let lookingFor = model.lookingFor
    if (model.seenBy) {
        entity.seenBy = model.seenBy
    }

    if (entity.showAge !== model.showAge && model.showAge != undefined) {
        entity.showAge = model.showAge
    }

    if (lookingFor) {
    if (lookingFor && lookingFor.age) {
        if (lookingFor.age.start) {
            entity.lookingFor.age.start = lookingFor.age.start
        }
        if (lookingFor.age.end) {
            entity.lookingFor.age.end = lookingFor.age.end
        }
    }
    if (lookingFor.gender) {
        entity.lookingFor.gender = lookingFor.gender
    }
}

    return entity.save()
}

const get = async (query, context) => {
    context.logger.start('get')
    let entity
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            entity = await db.preference.findById(query)
        } else {
            entity = await db.preference.findOne({
                name: {
                    $regex: query.name,
                    $options: 'i'
                },
                tenant: context.tenant
            })
        }
        if (entity) {
            return entity
        }
    }
    if (query.id) {
        entity = await db.preference.findById(query.id)
        if (entity) {
            return entity
        }
    }

    if (query.profile) {
        entity = await getByProfile({
            profile: query.profile,
            preferences: query.preferences
        }, context)
        if (entity) {
            return entity
        }
    }

    if (query.name) {
        entity = await db.preference.findOne({
            name: {
                $regex: query.name,
                $options: 'i'
            },
            tenant: context.tenant
        })

        if (!entity) {
            entity = await create({
                name: query.name
            }, context)
        }
    }

    return entity
}

const getByProfile = async (query, context) => {
    let preferences
    if (!query.profile) {
        return
    }

    if (typeof profile === 'string') {
        if (query.profile.isObjectId()) {
            preferences = await db.preference.findOne({
                profile: query.profile
            })
        }
    } else {
        preferences = await db.preference.findOne({
            profile: query.profile.id
        })
    }

    if (!preferences) {
        preferences = await create({
            seenBy: query.preferences.seenBy,
            showAge: query.preferences.showAge,
            lookingFor: query.preferences.lookingFor
        }, context)
    }

    return preferences
}

exports.get = get
exports.create = create
exports.update = update
