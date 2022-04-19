const CollaborationsPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const CollaborationsValidator = {
    validateCollaborationPayload: (payload) => {
        const result = CollaborationsPayloadSchema.validate(payload);

        if (result.error) {
            throw InvariantError(result.error.message);
        }
    }
}

module.exports = CollaborationsValidator;