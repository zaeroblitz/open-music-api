/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('playlist_song_activities', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'playlists'
        },
        song_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'songs'
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,            
            references: 'users'
        },
        action: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        time: {
            type: 'VARCHAR(50)',
            notNull: true,
        }
    });
};

exports.down = pgm => {
    pgm.dropTable('playlist_song_activities');
};
