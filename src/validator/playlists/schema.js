const Joi = require('joi');

const PlaylistsPayloadSchema = Joi.object({
    name: Joi.string().required(),
});

const SongPlaylistsPayloadSchema = Joi.object({
    songId: Joi.string().required(),
});

module.exports = { PlaylistsPayloadSchema, SongPlaylistsPayloadSchema};