module.exports = [{
    url: '/',
    get: { parameters: ['x-role-key'] }
}, {
    url: '/{id}',
    get: { parameters: ['x-role-key'] },
    put: { parameters: ['x-role-key'] }
}]
