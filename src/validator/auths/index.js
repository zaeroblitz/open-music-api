const { PostAuthPayloadSchema, PutAuthPayloadSchema, DeleteAuthPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AuthsValidator = {
    validatePostAuthPayload: (payload) => {
        const result = PostAuthPayloadSchema.validate(payload);

        if (result.error) {
            throw new InvariantError(result.error.message);
        }
    },
    validatePutAuthPayload: (payload) => {
        const result = PutAuthPayloadSchema.validate(payload);

        if (result.error) {
            throw new InvariantError(result.error.message);
        }
    },
    validateDeleteAuthPayload: (payload) => {
        const result = DeleteAuthPayloadSchema.validate(payload);

        if (result.error) {
            throw new InvariantError(result.error.message);
        }
    }
}

module.exports = AuthsValidator;