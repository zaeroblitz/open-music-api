const { nanoid } = require('nanoid');
const { Pool } = require ('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year]
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAllAlbums() {
        const query = 'SELECT * FROM albums';

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return result.rows[0];
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id]
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return result.rows[0];
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        }

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }
    }

    async getSongsByAlbum(albumId) {
        const query = {
            text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
            values: [albumId]
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async addAlbumCoverById(albumdId, coverUrl) {
        const query = {
            text: 'UPDATE albums SET "coverUrl" = $2 WHERE id = $1',
            values: [albumdId, coverUrl],
        };
        
        await this._pool.query(query);
    }

    async checkLikedAlbum(userId, albumId) {
        const isExists = await this.getAlbumById(albumId);

        if (isExists) {
            const query = {
                text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
                values: [userId, albumId]
            };

            const result = await this._pool.query(query);

            if (!result.rowCount) {
                return false;
            }

            return true;
        }        
    }

    async removeLikedAlbum(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId]
        };

        await this._pool.query(query);
        await this._cacheService.del(`count-album-likes:${albumId}`);
    }

    async addLikedAlbum(userId, albumId) {
        const isExists = await this.checkLikedAlbum(userId, albumId);

        if (isExists) {            
            await this.removeLikedAlbum(userId, albumId);
            return 'batal menyukai';
        } 
        
        const id = `album-like-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
            values: [id, userId, albumId],
        };            

        await this._pool.query(query);
        await this._cacheService.del(`count-album-likes:${albumId}`);

        return 'menyukai';
    }

    async countLikedAlbum(albumId) {
        try {
            const count = await this._cacheService.get(`count-album-likes:${albumId}`);
            const count_album_likes = {
                count: parseInt(count),
                cache: true
            }
            return count_album_likes;
        } catch (error) {
            const query = {
                text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
                values: [albumId]
            };

            const result = await this._pool.query(query);
            const count = result.rowCount;

            await this._cacheService.set(`count-album-likes:${albumId}`, count);
            const count_album_likes = {
                count: result.rowCount,
                cache: false
            };

            return count_album_likes;
        }
    }
}

module.exports = AlbumsService;