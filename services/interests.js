'use strict'

const db = require('../models')
const categories = require('./categories')

const populate = 'category'

const set = async (model, entity, context) => {
    if (model.name && entity.name !== model.name.toLowerCase()) {
        if (await this.get(model.name, context)) {
            throw new Error(`'${model.name}' already exists`)
        }

        entity.name = model.name.toLowerCase()
    }

    if (model.category) {
        entity.category = await categories.get(model.category, context)
    }

    if (model.status) {
        entity.status = model.status
    }
}

exports.create = async (model, context) => {
    let log = context.logger.start('services/interests:create')
    if (!model.name) {
        throw new Error('name is required')
    }

    let entity = new db.interest({
        status: 'active',
        tenant: context.tenant
    })

    await set(model, entity, context)
    await entity.save()

    log.end()

    return entity
}

exports.update = async (id, model, context) => {
    context.logger.debug('services/interests:update')

    let entity = await this.get(id, context)

    await set(model, entity, context)
    await entity.save()

    return entity
}

exports.remove = async (id, context) => {
    let entity = await this.get(id, context)
    entity.status = 'inactive'
    await entity.save()
}

exports.search = async (query, paging, context) => {
    let log = context.logger.start('services/interests:search')
    query = query || {}

    let where = {
        status: 'active',
        tenant: context.tenant
    }

    if (query.status) {
        where.status = query.status
    }

    if (query.name) {
        where['name'] = {
            $regex: query.name,
            $options: 'i'
        }
    }

    if (query.category) {
        where.category = await categories.get(query.category, context)
    }

    let items = await db.interest.find(where).populate(populate)

    log.end()

    return {
        items: items
    }
}

exports.get = async (query, context) => {
    context.logger.start('services/interests:get')
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.interest.findById(query).populate(populate)
        } else {
            return db.interest.findOne({
                name: query.toLowerCase(),
                tenant: context.tenant
            }).populate(populate)
        }
    }
    if (query.id) {
        return db.interest.findById(query.id).populate(populate)
    }

    if (query.name) {
        return db.interest.findOne({
            name: query.name.toLowerCase(),
            tenant: context.tenant
        }).populate(populate)
    }
}
