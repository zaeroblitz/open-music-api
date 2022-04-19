const { PlaylistsPayloadSchema, SongPlaylistsPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistsValidator = {
    validatePlaylistsPayload: (payload) => {
        const result = PlaylistsPayloadSchema.validate(payload);

        if (result.error) {
            throw new InvariantError(result.error.message);
        }
    },
    validateSongPlaylistsPayload: (payload) => {
        const result = SongPlaylistsPayloadSchema.validate(payload);

        if (result.error) {
            throw new InvariantError(result.error.message);
        }
    },
}

module.exports = PlaylistsValidator;