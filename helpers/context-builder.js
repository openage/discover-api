'use strict'
const db = require('../models')
const locks = require('./locks')

const create = async (claims, logger) => {
    let context = {
        logger: logger || claims.logger,
        config: {
            timeZone: 'IST'
        },
        permissions: []
    }

    let log = context.logger.start('context-builder:create')

    context.setTenant = async (tenant) => {
        if (!tenant) {
            return
        }
        if (tenant._doc) {
            context.tenant = tenant
        } else if (tenant.id) {
            context.tenant = await db.tenant.findOne({ _id: tenant.id })
        } else if (tenant.code) {
            context.tenant = await db.tenant.findOne({ code: tenant.code })
        }
    }

    context.setProfile = async (profile) => {
        if (!profile) {
            return
        }
        if (profile._doc) {
            context.profile = profile
        } else if (profile.id) {
            context.profile = await db.profile.findOne({ _id: profile.id })
        }

        context.permissions.push(profile.userType)
    }

    await context.setProfile(claims.profile)
    await context.setTenant(claims.tenant)

    context.getConfig = (identifier, defaultValue) => {
        var keys = identifier.split('.')
        var value = context.config

        for (var key of keys) {
            if (!value[key]) {
                return defaultValue
            }
            value = value[key]
        }

        return value
    }

    context.hasPermission = (request) => {
        if (!request) {
            return false
        }

        let items = Array.isArray(request) ? request : [request]

        return context.permissions.find(permission => {
            return items.find(item => item.toLowerCase() === permission)
        })
    }

    context.lock = async (resource) => {
        return locks.acquire(resource, context)
    }

    log.end()

    return context
}

exports.serializer = async (context) => {
    let serialized = {}

    if (context.employee) {
        serialized.employeeId = context.employee.id
    }

    if (context.organization) {
        serialized.organizationId = context.organization.id
    }

    return serialized
}

exports.deserializer = async (serialized, logger) => {
    let claims = {}

    if (serialized.employeeId) {
        claims.employee = {
            id: serialized.employeeId
        }
    }

    if (serialized.organizationId) {
        claims.organization = {
            id: serialized.organizationId
        }
    }

    return create(claims, logger)
}

exports.create = create
