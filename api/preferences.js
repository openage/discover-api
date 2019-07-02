'use strict'
var mapper = require('../mappers/preference')

const preferenceService = require('../services/preferences')
exports.create = async (req) => {
    var model = req.body

    let entity = await preferenceService.create(req.body, req.context)

    return mapper.toModel(entity)
}

exports.get = function (req, res) {
    if (req.params.id === 'my') {
        return mapper.toModel(preferenceService.get(req.context.profile.preferences.id, req.context))
    } else {
        return mapper.toModel(preferenceService.get(req.params.id, req.context))
    }
}
