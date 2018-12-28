"use strict";
var _ = require('underscore');
var models = require('mongoose').models;

exports.updateFields = function (data) {
    var changedFields = [],
        index,
        field,
        newValue;

    for (index in data.fields) {
        field = data.fields[index];

        newValue = data.newValues[field];
        if (data.modelObj[field] !== newValue) {
            changedFields.push(field);
            data.modelObj[field] = newValue;
        }
    }

    return changedFields;
};

exports.findProfile = function (profileId, callback) {
    models.Profile.findOne({
        _id : profileId
    })
        .exec(function (err, profile) {
            if (err) return callback(err);
            callback(err, profile);
        })
};

exports.execute = function (query, callback) {
    query
        .exec(function(err, data) {
            if(err) return callback(err);
            callback(null, data);
        })
};

exports.summaryModel = {
    profile: function (data, callback) {
        var items = [];

        _.each(data, function (model) {
            var item = model._doc;
            if (item.isComplete) {
                items.push({
                    id: item._id,
                    name: item.name,
                    following: item.following,
                    follower: item.follower,
                    friend: item.friend,
                    isComplete: item.isComplete,
                    isKnock: item.isKnock,
                    playerID: item.playerID,
                    profilePicData: item.profilePicData,
                    updated_At: item.updated_At,
                    jabber: {
                        id: parseInt(item.jabber.id, 10),
                        login: item.jabber.login
                    }
                });
            }
        });
        callback(null, items);
    },
    activity: function(data, callback) {
        var items = [];

        _.each(data, function(model) {
            var item = model._doc;
            items.push({
                id : item._id,
                isLike: item.isLike,
                isEditable: item.isEditable,
                profile : {
                    id : item.profile.id,
                    profilePicData : item.profile.profilePicData,
                    jabber : {
                        id : item.profile.jabber.id,
                        login : item.profile.jabber.login
                    }
                },
                subject : item.subject,
                dueDate : item.dueDate
            });
        });
        callback(null, items);
    },
    post: function(data, callback) {
        var items = [];

        _.each(data, function(model) {
            var item = model._doc;
            items.push({
                id: item._id,
                body:  {
                    header : item.body.header
                },
                playerID : item.playerID,
                profile : {
                    id : item.profile.id,
                    name : item.name,
                    profilePicData : item.profile.profilePicData,
                    jabber : {
                        id : item.profile.jabber.id,
                        login : item.profile.jabber.login
                    }
                },
                createdAt : item.created_At
            });
        });
        callback(null, items);
    }
};

exports.addParameters = {
    profile: function (data, myProfileId, callback) {
         data.forEach(function(item) {
            item.isConnection(myProfileId);
            item.isFollower(myProfileId);
            item.isFollowing(myProfileId);
            item.isKnock(myProfileId);
            item.isComplete();
        });
     callback(data)
    },
    activity: function (data, profileId, callback) {
        data.forEach(function(item) {
            item.isLike(profileId);
            item.isEditable(profileId);
        });
        callback(data)
    }
};

exports.addProfileParameters = function(data, myProfileId, callback) {
    data.forEach(function(item) {
        item.isConnection(myProfileId);
        item.isFollower(myProfileId);
        item.isFollowing(myProfileId);
        item.isKnock(myProfileId);
        item.isComplete();
    });
    callback(data)
};

exports.twoNotificationMethod = function (senderProfile, recieverProfile, type, callback) {
    var likeConnection1 = senderProfile.name + ' ' + 'is your new connection!';
    var likeConnection2 = recieverProfile.name + ' ' + 'is your new connection!';
    var object = {
        profileID : senderProfile.id,
        opponentID : recieverProfile.id,
        type : 'Connection'
    };
    var object2 = {
        profileID : recieverProfile.id,
        opponentID : senderProfile.id,
        type : 'Connection'
    };
    var notificationModel = {
        message : likeConnection1,
        playerID : recieverProfile.playerID,
        type : 'Connection'
    };
    var notificationModel2 = {
        message : likeConnection2,
        playerID : senderProfile.playerID,
        type : 'Connection'
    };
    var notification = new  models.Notification(object);
    var notification2 = new  models.Notification(object2);
    notification.save(function(err, notification) {
        if (err) return callback(err);
        notification2.save(function(err, notification2) {
            if (err) return callback(err);
            callback (null);
        })
    })
};

exports.singleNotificationMethod = function (profileId, opponentId, callback) {
    var object = {
        profileID : profileId,
        opponentID : opponentId,
        type : 'joinRequest'
    };
    var notification = new  models.Notification(object);
    notification.save(function(err, notification) {
        if (err) return callback(err);
        callback (null);
    })
};

exports.summaryProfile = function (data, callback) {
    var items = [];

    _.each(data, function(model) {
        var item = model._doc;
        if(item.isComplete && item.jabber) {
            items.push({
                id: item._id,
                name: item.name,
                following: item.following,
                follower: item.follower,
                friend: item.friend,
                isComplete: item.isComplete,
                isKnock: item.isKnock,
                playerID: item.playerID,
                profilePicData: item.profilePicData,
                updated_At: item.updated_At,
                jabber: {
                    id: parseInt(item.jabber.id, 10),
                    login: item.jabber.login
                }
            });
        }
    });
    callback(null, items);
};

exports.detailedProfile = function (data, callback) {
    var items = [];

    _.each(data, function(model) {
        var item = model._doc;
        if(item.isComplete && item.jabber) {
            items.push({
                id: item._id,
                following: item.following,
                follower: item.follower,
                friend: item.friend,
                isComplete: item.isComplete,
                isKnock: item.isKnock,
                profilePic : item.profilePic,
                name : item.name,
                dateOfBirth : item.dateOfBirth,
                about : item.about,
                gender : item.gender,
                profilePicData : item.profilePicData,
                location : item.locations,
                interests : item.interests,
                jabber : {
                    id: parseInt(item.jabber.id, 10),
                    login : item.jabber.login
                }
            });
        }
    });
    callback(items);
};

exports.paging = function (items, query, callback) {
    var itemsCount = _.size(items);

    var pagedItems = _.chain(items)
        .rest(((query.pageNo || 1)-1)* (query.pageSize || 100))
        .first((query.pageSize || 100))
        .value();

    callback(pagedItems, itemsCount);
};

exports.addActivityParameters =function (result, profileid) {
    data.forEach(function(item) {
        item.isLike(req.user.profile);
        item.isEditable(req.user.profile);
    });
};


