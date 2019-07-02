'use strict'

const contextBuilder = require('../helpers/context-builder')
const tenantService = require('../services/tenants')
const userService = require('../services/users')

const directory = require('@open-age/directory-client')
const db = require('../models')

const fetch = (req, modelName, paramName) => {
    var value = req.query[`${modelName}-${paramName}`] || req.headers[`x-${modelName}-${paramName}`]
    if (!value && req.body[modelName]) {
        value = req.body[modelName][paramName]
    }
    if (!value) {
        return null
    }

    var model = {}
    model[paramName] = value
    return model
}

const populateFromRole = (role, context) => {
    let firstName = role.user.profile.firstName
    let lastName = role.user.profile.lastName

    return {
        name: `${firstName} ${lastName}`.trim(),
        gender: role.user.profile.gender,
        dob: role.user.profile.dob,
        pic: role.user.pic,
        status: 'active',
        role: role
    }
}

const getFromDirectory = async (roleKey, logger) => {
    const log = logger.start('services/users:getFromDirectory')
    let profile = await db.profile.findOne({ 'role.key': roleKey }).populate('tenant preferences')
    if (profile) {
        return profile
    }

    const role = await directory.roles.get(roleKey)
    logger.debug(role)

    if (!role) {
        log.error(`could not find any role with key ${roleKey}`)
        return null
    }

    let context = await contextBuilder.create({}, logger)

    let tenant = await tenantService.getByCode(role.tenant.code, context) ||
        await tenantService.create(role.tenant, context)

    await context.setTenant(tenant)

    profile = await db.profile.findOne({ 'role.id': role.id }).populate('tenant')

    if (!profile) {
        var model = populateFromRole(role, context)
        profile = await profileService.create(model, context)
    }

    profile.role = profile.role || {}
    profile.role.id = `${role.id}`
    profile.role.code = role.code
    profile.role.key = role.key
    profile.role.permissions = role.permissions || []

    await profile.save()
    log.end()
    return profile
}

const extractFromRoleKey = async (roleKey, logger) => {
    let log = logger.start('extractRoleKey')
    let user = await userService.getFromDirectory(roleKey, logger)
    if (!user) {
        throw new Error('invalid role key')
    }

    user.lastSeen = Date.now()
    await user.save().catch(error => {
        console.log(error)
    })
    log.end()

    return user
}

exports.requiresRoleKey = (req, res, next) => {
    let log = res.logger.start('helpers/auth:requiresRoleKey')
    var role = fetch(req, 'role', 'key')

    if (!role) {
        return res.status(403).send({
            success: false,
            message: 'role key is required.'
        })
    }

    extractFromRoleKey(role.key, log).then(user => {
        contextBuilder.create({
            user: user,
            tenant: user.tenant,
            organization: user.organization
        }, res.logger).then(context => {
            req.context = context
            next()
        })
    }).catch(err => {
        res.failure('invalid credentials')
    })
}
