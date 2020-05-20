'use strict'

const db = require('../models')

const set = async (model, entity, context) => {
    if (model.name && entity.name !== model.name.toLowerCase()) {
        if (await this.get(model.name, context)) {
            throw new Error(`'${model.name}' already exists`)
        }

        entity.name = model.name.toLowerCase()
    }

    if (model.pic) {
        let url = model.pic.url || model.pic
        entity.pic = {
            url: url,
            thumbnail: model.pic.thumbnail || url
        }
    }

    if (model.status) {
        entity.status = model.status
    }

    if (model.entityId) {
        entity.entityId = model.entityId
    }
}

exports.create = async (model, context) => {
    let log = context.logger.start('services/categories:create')
    if (!model.name) {
        throw new Error('name is required')
    }

    let entity = new db.category({
        status: 'active',
        tenant: context.tenant
    })

    await set(model, entity, context)
    await entity.save()

    log.end()

    return entity
}

exports.update = async (id, model, context) => {
    context.logger.debug('services/categories:update')

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
    let log = context.logger.start('services/categories:search')
    query = query || {}

    let where = {
        status: 'active',
        tenant: context.tenant
    }

    if (query.status) {
        where.status = query.status
    }

    if (query.entityId) {
        where.entityId = query.entityId
    }

    if (query.name) {
        where['name'] = {
            $regex: query.name,
            $options: 'i'
        }
    }

    let items = await db.category.find(where)

    log.end()

    return {
        items: items
    }
}

exports.get = async (query, context) => {
    context.logger.start('services/categories:get')
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.category.findById(query)
        } else {
            return db.category.findOne({
                name: query.toLowerCase(),
                tenant: context.tenant
            })
        }
    }
    if (query.id) {
        return db.category.findById(query.id)
    }

    if (query.entityId) {
        return db.category.findOne({
            entityId: query.entityId.toLowerCase(),
            tenant: context.tenant
        })
    }

    if (query.name) {
        return db.category.findOne({
            name: query.name.toLowerCase(),
            tenant: context.tenant
        })
    }
}
