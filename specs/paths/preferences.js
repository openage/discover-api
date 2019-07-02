module.exports = [{
    url: '/',
    post: { parameters: ['x-role-key'] }
}, {
    url: '/{id}',
    get: { parameters: ['x-role-key'] }
}]
