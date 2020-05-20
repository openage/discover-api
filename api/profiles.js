'use strict'

let service = require('../services/profiles')
const api = require('./api-base')('profiles', 'profile')

api.my = async (req) => {
    let entity = await service.my(req.params.id, req.body, req.context)

    return {
        date: entity.date,
        rating: entity.rating,
        status: entity.status
    }
}

api.react = async (req) => {
    let entity = await service.react(req.body, req.context)
    return 'reacted succesfully'
}

module.exports = api
// const mapper = require('../mappers/profile')
// const profileService = require('../services/profiles')
// const pagingHelper = require('../helpers/paging')

// exports.create = async (req) => {
//     let entity = {}

//     if (req.body.entity) {
//         entity = req.body.entity
//     } else if (req.query['entity-type']) {
//         entity.type = req.query['entity-type']
//         entity.id = req.query['entity-id']
//     } else if (req.params.entityType) {
//         entity.type = req.params.entityType
//         entity.id = req.params.entityId
//     } else {
//         entity.type = 'role'
//         entity.id = context.role ? context.role.id : context.user.role.id
//     }

//     let profile = await profileService.getByEntity(entity, req.context)

//     if (!profile) {
//         profile = await profileService.create(req.body, req.context)
//     } else {
//         profile = await profileService.update(profile.id, req.body, req.context)
//     }

//     return mapper.toModel(profile)
// }

// exports.update = async (req) => {
//     let entity = await profileService.update(req.context.profile.id, req.body, req.context)

//     return mapper.toMyProfileModel(entity)
// }

// exports.get = async (req) => {
//     if (req.params.id === 'my') {
//         return mapper.toMyProfileModel(await profileService.get(req.context.profile.id, req.context))
//     } else {
//         return mapper.toModel(await profileService.get(req.params.id, req.context))
//     }
// }

// // only active and
// exports.search = async (req) => {
//     let page = pagingHelper.extract(req)

//     let result = await profileService.search(req.query, page, req.context)

//     return {
//         items: mapper.toSearchModel(result.items),
//         count: result.count
//     }
// }
