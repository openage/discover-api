module.exports = [{
    url: '/:id',
    put: {
        permissions: ['tenant.user']
    },
    delete: {
        permissions: ['tenant.user']
    },
    get: {
        permissions: ['tenant.user']
    }
}]
