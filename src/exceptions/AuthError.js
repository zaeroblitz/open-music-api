const ClientError = require('./ClientError');

class AuthError extends ClientError {
    constructor(message) {
        super(message, 403);
        this.name = 'AuthError';
    }
}

module.exports = AuthError;