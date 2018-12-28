'use strict'

exports.toModel = (entity) => {
    if (!entity.profile._doc) {
        return {
            id: entity.profile.toString(),
            status: entity.status,
            profile: {
                id: entity.profile.toString()
            },
            date: entity.date
        }
    }

    return {
        id: entity.profile.id,
        status: entity.status,
        profile: {
            id: entity.profile.id,
            name: entity.profile.name,
            picUrl: entity.profile.picUrl,
            picData: entity.profile.picData,
            lastSeen: entity.profile.lastSeen
        },
        date: entity.date
    }
}
