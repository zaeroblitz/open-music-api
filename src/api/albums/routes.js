const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: handler.postAlbumHandler,        
    },
    {
        method: 'GET',
        path: '/albums',
        handler: handler.getAllAlbumsHandler,        
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumByIdHandler,        
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.putAlbumByIdHandler,        
    },    
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: handler.deleteAlbumByIdHandler,        
    },
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        handler: handler.addOrRemoveLikedAlbumHandler,
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/{id}/likes',
        handler: handler.getCountLikedAlbumHandler,
    },
];

module.exports = routes;