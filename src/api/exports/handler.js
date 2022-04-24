class ExportsHandler {
    constructor(producerService, playlistsService, validator) {
        this._producerService = producerService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postExportPlaylist = this.postExportPlaylist.bind(this);
    }

    async postExportPlaylist(request, h) {
        this._validator.validateExportPlaylistPayload(request.payload);     
        
        const { playlistId } = request.params;
        const { id: userId } = request.auth.credentials;

        const message = {
            playlistId: playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
        await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;