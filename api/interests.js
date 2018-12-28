'use strict'
var mapper = require('../mappers/interest')

const interestService = require('../services/interests')

exports.create = async (req) => {
    var model = req.body

    if (!model.name) {
        throw new Error('name is required')
    }

    let entity = await interestService.create(req.body, req.context)

    return mapper.toModel(entity)
}

exports.delete = async (req) => {
    var id = req.params.id

    await interestService.remove(id, req.context)

    return 'interest deleted'
}

exports.search = async (req) => {
    return {
        items: interestService.search(req.query, req.context).map(mapper.toModel)
    }
}
