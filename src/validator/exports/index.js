const ExportPlaylistsPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportPlaylistValidator = {
    validateExportPlaylistPayload: (payload) => {
        const result = ExportPlaylistsPayloadSchema.validate(payload);

        if (result.error) throw InvariantError(result.error.message);
    }
}

module.exports = ExportPlaylistValidator;