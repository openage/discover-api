'use strict'

const db = require('../models')

const remove = async (id, context) => {
    let log = context.logger.start('services/interests:remove')

    let profile = await db.profile.findById(context.profile.id).populate('interests')

    profile.interests = profile.interests.filter(item => item.id !== id)

    await profile.save()
}

const create = async (model, context) => {
    let log = context.logger.start('services/interests:create')
    if (!model.name) {
        throw new Error('name is needed')
    }

    let interest = await db.interest.findOne({
        name: {
            $regex: model.name,
            $options: 'i'
        },
        tenant: context.tenant
    })

    if (!interest) {
        interest = await new db.interest({
            name: model.name,
            tenant: context.tenant
        }).save()
    }

    log.end()

    return interest
}

const update = async (model, entity, context) => {
    context.logger.debug('services/interests:update')

    if (model.name && entity.name.toLowerCase() !== model.name.toLowerCase()) {
        let exists = await db.interest.findOne({
            name: {
                $regex: model.name,
                $options: 'i'
            },
            tenant: context.tenant
        })

        if (exists) {
            throw new Error(`interest with name '${model.name}' already exists`)
        }

        entity.name = model.name
    }

    return entity.save()
}

const search = async (query, context) => {
    let log = context.logger.start('services/interests:search')
    query = query || {}

    let where = {
        tenant: context.tenant
    }

    if (query.name) {
        where['name'] = {
            $regex: query.name,
            $options: 'i'
        }
    }

    let items = await db.interest.find(where)

    log.end()

    return items
}

const get = async (query, context) => {
    context.logger.start('get')
    let entity
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            entity = await db.interest.findById(query)
        } else {
            entity = await db.interest.findOne({
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
        entity = await db.interest.findById(query.id)
        if (entity) {
            return entity
        }
    }

    if (query.name) {
        entity = await db.interest.findOne({
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

exports.get = get
exports.remove = remove
exports.create = create
exports.update = update
exports.search = search
