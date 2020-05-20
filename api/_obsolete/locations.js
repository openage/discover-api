'use strict'

const cities = require('all-the-cities')
const sphereKnn = require('sphere-knn')
const lookup = sphereKnn(cities)

exports.get = async (req) => {
    var locations = []
    var locs = lookup(req.query.lat, req.query.lng, 20, 50000)
    locs.forEach(item => {
        locations.push({
            coordinates: [item.lon, item.lat],
            name: item.name,
            country: item.country
        })
    })
    return {
        items: locations
    }
}
