
module.exports = [{
    url: '/',
    get: {
        permissions: ['tenant.guest', 'tenant.user']
    },
    post: {
        permissions: ['tenant.user']
    }
},{
    url: '/react',
    post: {
        method: 'react',
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
}, {
    url: '/:id/my',
    put: {
        method: 'my',
        id: 'profile-my',
        summary: 'my attributes in profile',
        permissions: ['tenant.user']
    }
}]
