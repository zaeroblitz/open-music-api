const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const AuthError = require('../exceptions/AuthError');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');

class PlaylistsService {
    constructor(collaborationService) {
        this._pool = new Pool();
        this._collaborationService = collaborationService;
    }

    async addPlaylist(name, owner) {
        const id = `playlist-${nanoid(16)}`;
        
        const query = {
            text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, owner]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Playlists gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username
            FROM playlists
            LEFT JOIN users ON playlists.owner = users.id
            WHERE playlists.owner = $1`,
            values: [owner]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlists tidak ditemukan');
        }

        return result.rows;
    }

    async getPlaylistFromId(playlistId) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username
            FROM playlists
            LEFT JOIN users ON playlists.owner = users.id
            WHERE playlists.id = $1`,
            values: [playlistId]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        return result.rows[0];
    }

    async deletePlaylist(playlistsId, owner) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 AND owner = $2 RETURNING id',
            values: [playlistsId, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlists tidak ditemukan');
        }
    }

    async addSongToPlaylist(playlistId, songId) {
        const id = `playlist_songs-${nanoid(16)}`;

        const checkSong = await this.checkSongInPlaylist(playlistId, songId);
        
        if (checkSong) {
            throw new InvariantError('Lagu sudah ada di dalam playlist');
        }

        const query = {
            text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError(`Gagal menambahkan lagu ke dalam playlist`);
        }

        return result.rows[0].id;
    }

    async getSongsFromPlaylist(playlistId) {
        const query = {
            text: `SELECT songs.id, songs.title, songs.performer
            FROM songs
            JOIN playlist_songs ON songs.id = playlist_songs.song_id 
            WHERE playlist_songs.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return result.rows;
    }

    async deleteSongFromPlaylist(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
    }

    async checkSongInPlaylist(playlistId, songId) {
        const query = {
            text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId]
        }

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            return false;
        }        

        return true;
    }

    async addPlaylistSongActivity(playlistId, songId, userId, action) {
        const id = `activity-${nanoid(16)}`;
        const time = new Date().toISOString();

        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, userId, action, time]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Aktivitas Playlist gagal ditambahkan');
        }                
    }

    async getPlaylistSongActivities(playlistId) {
        const query = {
            text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
            FROM playlist_song_activities
            RIGHT JOIN users ON users.id = playlist_song_activities.user_id
            RIGHT JOIN songs ON songs.id = playlist_song_activities.song_id
            WHERE playlist_song_activities.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Aktivitas Playlist tidak ditemukan');
        }

        return result.rows;
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];

        if (playlist.owner !== owner) {
            throw new AuthError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationService.verifyCollabolator(playlistId, userId);
            } catch (error) {
                throw error;
            }
        }
    }
}

module.exports = PlaylistsService;