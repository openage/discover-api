'use strict'

const setProfile = (profile, context) => {
    if (!profile) {
        return { pic: {} }
    }
    let model = {
        firstName: profile.firstName,
        lastName: profile.lastName
    }

    if (profile.pic) {
        model.pic = {
            url: profile.pic.url,
            thumbnail: profile.pic.thumbnail
        }
    }

    return model
}

const setPreferences = (preferences, context) => {
    let model = {
        age: {
            start: 0,
            end: 100
        },
        gender: 'any',
        coordinates: [],
        interests: []
    }

    if (!preferences) {
        return model
    }

    model.age.start = preferences.age.start || model.age.start
    model.age.end = preferences.age.end || model.age.end
    model.gender = preferences.gender || model.gender

    if (preferences.coordinates && preferences.coordinates.length) {
        model.coordinates = preferences.coordinates
    }

    if (preferences.interests && preferences.interests.length) {
        model.interests = preferences.interests.map(i => {
            return {
                id: i.id,
                name: i.name
            }
        })
    }

    return model
}

exports.toModel = (entity, context) => {
    if (!entity) {
        return
    }

    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }
    const model = {
        id: entity.id,
        code: entity.code,
        phone: entity.phone,
        email: entity.email,
        status: entity.status,
        profile: setProfile(entity.profile, context),
        recentLogin: entity.recentLogin
    }

    // todo add config

    return model
}

exports.toSummary = (entity, context) => {
    return {
        id: entity.id,
        code: entity.code,
        profile: setProfile(entity.profile, context)
    }
}
