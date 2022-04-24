class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAllAlbumsHandler = this.getAllAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.addOrRemoveLikedAlbumHandler = this.addOrRemoveLikedAlbumHandler.bind(this);
    this.getCountLikedAlbumHandler = this.getCountLikedAlbumHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAllAlbumsHandler(request, h) {
    const albums = await this._service.getAllAlbums();

    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsByAlbum(id);
    const albumWithSongs = { ...album, songs };

    return {
      status: 'success',
      data: {
        album: albumWithSongs,
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async addOrRemoveLikedAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    const result =  await this._service.addLikedAlbum(userId, albumId);

    const response = h.response({
        status: 'success',
        message: `Berhasil ${result} album`,
    });
    response.code(201);
    return response;
  }

  async getCountLikedAlbumHandler(request, h) {
    const { id: albumId } = request.params;

    const count = await this._service.countLikedAlbum(albumId);
    
    return {
      status: 'succes',
      data: {
        likes: count,
      }
    };
  }
}

module.exports = AlbumsHandler;
