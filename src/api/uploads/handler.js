class UploadsHandler {
    constructor(storageService, albumsService, validator) {
        this._storageService = storageService;
        this._albumsService = albumsService;
        this._validator = validator;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
    }

    async postUploadImageHandler(request, h) {
        const { cover: data } = request.payload;
        const { id: albumId } = request.params;

        this._validator.validateImageHeaders(data.hapi.headers);

        const coverUrl = await this._storageService.writeFile(data, data.hapi);
        await this._albumsService.addAlbumCoverById(albumId, coverUrl);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }
}

module.exports = UploadsHandler;