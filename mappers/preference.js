'use strict'
var _ = require('underscore')

var mapper = exports
mapper.toModel = (entity) => {
    var model = {
        id: entity.id,
        showAge: entity.showAge,
        seenBy: entity.seenBy,
        gender: entity.gender,
        profile: entity.profile,
        timeStamp: entity.timeStamp,
        lookingFor: entity.lookingFor
    }

    return model
}
