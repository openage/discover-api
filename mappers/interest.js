'use strict'

exports.toModel = function (entity, context) {
    if (!entity) {
        return
    }

    if (entity._bsontype === 'ObjectID') {
        return {
            id: entity.toString()
        }
    }

    let model = {
        id: entity.id,
        name: entity.name
    }

    if (entity.category) {
        if (entity.category._bsontype === 'ObjectID') {
            model.category = {
                id: entity.category.toString()
            }
        } else {
            model.category = {
                id: entity.category.id,
                name: entity.category.name
            }
        }
    }

    return model
}

exports.groupBy = function (entities) {
    return entities.reduce((result, currentValue) => {
        let category = currentValue.category

        let group = result.find(c => c.id === category.id)

        if (!group) {
            group = {
                id: category.id,
                name: category.name,
                interests: []
            }

            result.push(group)
        }

        group.interests.push({
            id: currentValue.id,
            name: currentValue.name
        })

        return result
    }, [])
}
