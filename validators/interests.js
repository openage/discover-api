'use strict'

exports.canCreate = async (req) => {
    var model = req.body

    if (!model.name && !model.id) {
        return 'name or id is required'
    }
}
