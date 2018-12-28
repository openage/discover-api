'use strict';
var _ = require('underscore');

var getInterests = function(category) {
    var interests = [];

    if (!category.interests) {
        return interests;
    }

    _.each(category.interests, function(interest) {
        interests.push({
            id: interest.id,
            name: interest.name
        });
    });

    return interests;
};


exports.toModel = function(entity) {
    return {
        id: entity.id,
        name: entity.name,
        category: {
            id: entity.category
        }
    };
};


exports.toMixModel = function(entities) {
    var mixModels = [];
    _.each(entities, function(entity) {
        mixModels.push({
            id: entity.id,
            name: entity.name,
            interests: getInterests(entity)
        });
    });
    return mixModels;
};

exports.groupBy = function(entities) {

    var categories = [];

    var groups =
        _.groupBy(entities, function(interest) {
            return interest.category.id;
        });

    groups = _.toArray(groups);

    _.each(groups, function(category) {
        var obj = category[0].category;
        obj.interests = category;

        categories.push(obj);
    });
    return exports.toMixModel(categories);

};