'use strict'
var mapper = require('../mappers/profile')
const profileService = require('../services/profiles')

exports.update = async (req) => {
    let entity = await profileService.update(req.context.profile.id, req.body, req.context)

    return mapper.toMyProfileModel(entity)
}

exports.get = async (req) => {
    if (req.params.id === 'my') {
        return mapper.toMyProfileModel(await profileService.get(req.context.profile.id, req.context))
    } else {
        return mapper.toModel(await profileService.get(req.params.id, req.context))
    }
}

// only active and
exports.search = async (req) => {
    if (req.context.profile.status === 'inComplete') {
        throw new Error('complete your profile to search')
    }

    let profiles = await profileService.discover(req.query, req.context)

    return {
        items: profiles.map(mapper.toModel)
    }
}
