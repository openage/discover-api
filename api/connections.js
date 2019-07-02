'use strict'
var async = require('async')
var _ = require('underscore')
var mapper = require('../mappers/connection')
var db = require('mongoose').models

var notify = function (hisProfile, hisConnection, myConnection, myProfile, hasChanged, cb) {
    var connection = mapper.toModel(hisConnection)

    // if (hasChanged) {
    //     notificationService.notify(hisProfile, {
    //         entity: {
    //             id: connection.profile.id,
    //             name: myProfile.name,
    //             picData: myProfile.picData,
    //             picUrl: myProfile.picUrl,
    //             type: 'profile',
    //             data: connection.profile
    //         },
    //         api: 'connections',
    //         action: connection.status
    //     }, function () {
    //         cb(null, myConnection)
    //     })
    // } else {
    cb(null, myConnection)
    // }
}

var getConnections = async (hisProfile, context) => {
    var hisConnection = hisProfile.connections.find(function (item) {
        return item.profile.toString() === context.profile.id
    })
    var myConnection = context.profile.connections.find(function (item) {
        return item.profile.toString() === hisProfile.id
    })

    return {
        his: hisConnection,
        my: myConnection
    }
}

var updateStatus = async (status, hisProfile, context) => {
    let connections = getConnections(hisProfile, context)

    var hasChanged = false

    if (!connections.his || !connections.my) {
        throw Error('relationship does not exist')
    }

    switch (status) {
    case 'blocked':
        if ('deleted|blocked'.indexOf(connections.my.status) === -1) {
            connections.my.status = 'blocked'
            connections.his.status = 'blocked'
            hasChanged = true
        }
        break
    case 'active':
        if (connections.my.status === 'inComming') {
            connections.my.status = 'active'
            connections.his.status = 'active'
            hasChanged = true

            // removing notification for active connection

            var requestNotification = context.profile.notifications.find(notificationBlock => {
                return notificationBlock.data.entity.id === hisProfile.id &&
                        notificationBlock.data.api === 'connections' &&
                        notificationBlock.data.action === 'inComming'
            })

            context.profile.notifications.splice(context.profile.notifications.indexOf(requestNotification), 1)
        }
        break
    case 'deleted':
        if (connections.my.status !== 'deleted') {
            connections.my.status = 'deleted'
            connections.his.status = 'deleted'
            hasChanged = true
        }
        break
    default:
        break
    }
    if (hasChanged) {
        await context.profile.save()
        await hisProfile.save()
    }

    return connections.my

    // TODO: notify
}

var api = exports

// creates outGoing connection if none exist,
// accepts a inComming connection
// does nothing in other cases
// POST connections { profile }
api.create = async (req) => {
    // posted a profile
    var myProfile = req.context.profile

    let hisProfile = await db.profile.findById(req.body.connection.profile.id)
        .populate('connections')

    var connections = await getConnections(hisProfile, req.context)

    var hasChanged = true
    if (req.body.connection.status === 'ignored') {
        connections.my = {
            status: 'ignored',
            profile: hisProfile,
            date: new Date()
        }
        myProfile.connections.push(connections.my)
        await myProfile.save()
        hasChanged = false
    }

    if (req.body.connection.status === 'bookmarked') {
        connections.my = {
            status: 'bookmarked',
            profile: hisProfile,
            date: new Date()
        }
        myProfile.connections.push(connections.my)
        await myProfile.save()
        hasChanged = false
    }

    if (req.body.connection.status === 'blocked') {
        connections.my = {
            status: 'blocked',
            profile: hisProfile,
            date: new Date()
        }
        myProfile.connections.push(connections.my)
        await myProfile.save()
        hasChanged = false
    }

    if (connections.his && connections.my) {
        req.context.logger.debug('already have the connection. mine', connections.my.status)
        req.context.logger.debug('already have the connection. his:', connections.his.status)

        if (connections.his.status === 'outGoing') {
            req.context.logger.info('making connection active between profiles')
            connections.his.status = 'active'
            connections.my.status = 'active'
        } else if ('outGoing|active'.indexOf(connections.my.status) === -1) {
            req.context.logger.info('resetting connection status to outGoing')
            connections.his.status = 'inComming'
            connections.my.status = 'outGoing'
        } else {
            req.context.logger.info('cannot change the state of this connection')
            hasChanged = false
        }
    } else if (req.body.connection.status !== 'ignored' && req.body.connection.status !== 'blocked' && req.body.connection.status !== 'bookmarked') {
        req.context.logger.info('creating new connection request')

        connections.his = {
            status: 'inComming',
            like: req.body.connection.like,
            profile: myProfile,
            date: new Date()
        }
        hisProfile.connections.push(connections.his)

        connections.my = {
            status: 'outGoing',
            like: req.body.connection.like,
            profile: hisProfile,
            date: new Date()
        }
        myProfile.connections.push(connections.my)
    }

    if (hasChanged) {
        await myProfile.save()
        await hisProfile.save()
        // todo: send message via sendit
    }

    return mapper.toModel(connections.my)
}

// status = active, deleted
// PUT connections/{profileId}
api.update = async (req) => {
    var myProfile = req.context.profile

    let hisProfile = await db.profile.findById(req.params.id || req.body.connection.profile.id)
        .populate('connections')

    let connection = await updateStatus(req.body.connection.status, hisProfile, req.context)
    if (connection.status !== req.body.connection.status) {
        throw new Error('cannot change the status from: ' + connection.status + ' to: ' + req.body.connection.status)
    }
    return mapper.toModel(connection)
}

// to Unfriend
// DELETE connections/{profileId}
api.delete = async (req) => {
    var myProfile = req.context.profile
    await updateStatus('deleted', req.params.id, req.context)
}

api.search = async (req) => {
    let profile = await db.profile.findById(req.context.profile.id)
        .populate('connections.profile')

    var connections = profile.connections.filter(function (item) {
        return item.status === 'active'
    })
    return connections.map(mapper.toModel)
}

api.cancelRequest = function (req, res) {
    var myProfile = req.context.profile
    var removeNotificationFrom
    var requestBy

    if (req.params.id === myProfile.id) {
        return res.failure('enter requested or requesting profile id')
    }

    async.waterfall([
        function (cb) {
            getConnections(myProfile, req.params.id, cb)
        },
        function (hisProfile, connections, cb) {
            if (connections.his.status === 'outGoing' || connections.my.status === 'inComming' &&
                connections.his.status === 'inComming' || connections.my.status === 'outGoing') {
                // removeNotificationFrom = connections.his.status === "inComming" ? hisProfile : myProfile;

                if (connections.his.status === 'inComming') {
                    removeNotificationFrom = hisProfile
                    requestBy = myProfile
                } else {
                    removeNotificationFrom = myProfile
                    requestBy = hisProfile
                }

                hisProfile.connections.splice(hisProfile.connections.indexOf(connections.his), 1)
                myProfile.connections.splice(myProfile.connections.indexOf(connections.my), 1)

                async.parallel([
                    function (callback) {
                        hisProfile.save(callback)
                    },
                    function (callback) {
                        myProfile.save(callback)
                    }
                ], function (err) {
                    if (err) {
                        return cb(err)
                    }
                    cb(null)
                })
            } else {
                cb('status mismatch')
            }
        },
        function (cb) {
            db.profile.findOneAndUpdate({
                _id: removeNotificationFrom.id
            }, {
                $pull: {
                    notifications: {
                        'data.entity.id': requestBy.id.toString(),
                        'data.api': 'connections',
                        'data.action': 'inComming'
                    }
                }
            }, function (err, result) {
                if (err) {
                    return cb(err)
                }
                cb(null)
            })
        }
    ],
    function (err) {
        if (err) {
            return res.failure(err)
        }
        res.success('request deleted')
    })
}
