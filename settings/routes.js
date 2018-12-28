'use strict'
const auth = require('../helpers/auth')
const apiRoutes = require('@open-age/express-api')
const fs = require('fs')
const loggerConfig = require('config').get('logger')
const appRoot = require('app-root-path')
const specs = require('../specs')

module.exports.configure = (app, logger) => {
    logger.start('settings:routes:configure')
    app.get('/', (req, res) => {
        res.render('index', {
            title: 'Discovery API'
        })
    })

    app.get('/logs', function (req, res) {
        var filePath = appRoot + '/' + loggerConfig.file.filename

        fs.readFile(filePath, function (err, data) {
            res.contentType('application/json')
            res.send(data)
        })
    })
    app.get('/swagger', (req, res) => {
        res.writeHeader(200, {
            'Content-Type': 'text/html'
        })
        fs.readFile('./public/swagger.html', null, function (err, data) {
            if (err) {
                res.writeHead(404)
            }
            res.write(data)
            res.end()
        })
    })

    app.get('/specs', function (req, res) {
        fs.readFile('./public/specs.html', function (err, data) {
            res.contentType('text/html')
            res.send(data)
        })
    })
    app.get('/api/specs', function (req, res) {
        res.contentType('application/json')
        res.send(specs.get())
    })
    app.get('/api/versions/current', function (req, res) {
        var filePath = appRoot + '/version.json'

        fs.readFile(filePath, function (err, data) {
            res.contentType('application/json')
            res.send(data)
        })
    })

    var api = apiRoutes(app)

    api.model('locations')
        .register({
            action: 'GET',
            method: 'get',
            filter: auth.requiresRoleKey
        })

    api.model('profiles')
        .register('REST', auth.requiresRoleKey)
        .register([{
            action: 'POST',
            url: '/invite',
            method: 'invite',
            filter: auth.requiresRoleKey
        }])

    api.model('connections')
        .register('REST', auth.requiresRoleKey)
        .register({
            action: 'PUT',
            method: 'cancelRequest',
            url: '/cancel/:id',
            filter: auth.requiresRoleKey
        })

    api.model('interests')
        .register('REST', auth.requiresRoleKey)
}
