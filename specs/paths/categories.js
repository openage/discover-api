module.exports = [{
    url: '/',
    get: {
        permissions: ['tenant.guest', 'tenant.user']
    },
    post: {
        permissions: ['tenant.user']
    }
}, {
    url: '/:id',
    put: {
        permissions: ['tenant.user']
    },
    delete: {
        permissions: ['tenant.user']
    },
    get: {
        permissions: ['tenant.guest', 'tenant.user']
    }
}]
