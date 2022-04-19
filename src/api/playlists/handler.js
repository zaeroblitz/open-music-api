class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);

        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
        this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);

        this.getPlaylistSongActivitiesHandler = this.getPlaylistSongActivitiesHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistsPayload(request.payload);

        const { name } = request.payload;
        const { id: owner } = request.auth.credentials;
        const playlistId = await this._service.addPlaylist(name, owner);

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            }
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request, h) {
        const { id: owner } = request.auth.credentials;
        
        const getPlaylists = await this._service.getPlaylists(owner);
        
        return {
            status: 'success',
            data: {
                playlists: getPlaylists.map((playlist) => ({
                    id: playlist.id,
                    name: playlist.name,
                    owner: playlist.username,
                }))
            },
        };
    }

    async deletePlaylistHandler(request, h) {
        const { id } = request.params;
        const { id: owner } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(id, owner);
        await this._service.deletePlaylist(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus'
        }
    }

    async postSongToPlaylistHandler(request, h) {
        this._validator.validateSongPlaylistsPayload(request.payload);

        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        await this._service.addSongToPlaylist(playlistId, songId);
        await this._service.addPlaylistSongActivity(playlistId, songId, credentialId, 'add');
        
        const response = h.response({
            status: 'success',
            message: `Lagu berhasil ditambahkan ke dalam playlist ${playlistId}`,            
        });
        response.code(201);
        return response;
    }

    async getSongsFromPlaylistHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        const playlist = await this._service.getPlaylistFromId(playlistId);
        const songs = await this._service.getSongsFromPlaylist(playlistId);
        const playlist_with_songs = {...playlist, songs};

        return {
            status: 'success',
            data: {
                playlist: playlist_with_songs,
            }
        }
    }

    async deleteSongFromPlaylistHandler(request, h) {
        this._validator.validateSongPlaylistsPayload(request.payload);

        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        await this._service.deleteSongFromPlaylist(playlistId, songId);
        await this._service.addPlaylistSongActivity(playlistId, songId, credentialId, 'delete');

        return {
            status: 'success',
            message: `Lagu berhasil dihapus dari playlist ${playlistId}`,
        };
    }

    async getPlaylistSongActivitiesHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        const activities = await this._service.getPlaylistSongActivities(playlistId);

        const result = {playlistId, activities};

        return {
            status: 'success',
            data: {
                result,
            }
        }
    }
}

module.exports = PlaylistsHandler;