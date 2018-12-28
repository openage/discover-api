'use strict'
const db = require('../models')

const create = async (model, context) => {
    let log = context.logger.start('create')
    try {
        let tenant = await db.tenant.findOrCreate({ code: model.code, name: model.name }, model)

        if (tenant.created) {
            log.info('new tenant created')
        } else {
            log.info('tenant already exist')
        }

        return tenant.result
    } catch (error) {
        log.error(error)
        return error
    }
}

const getById = async (id, context) => {
    context.logger.start('services/tenants:getById')

    return db.tenant.findById(id)
}

const getByCode = async (code, context) => {
    context.logger.start('services/tenants:getByCode')

    return db.tenant.findOne({ code: code })
}

exports.create = create
exports.getById = getById
exports.getByCode = getByCode
