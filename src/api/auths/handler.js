class AuthsHandler {
    constructor(authsService, usersService, tokenManager, validator) {
        this._authsService = authsService;
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        this.postAuthHandler = this.postAuthHandler.bind(this);
        this.putAuthHandler = this.putAuthHandler.bind(this);
        this.deleteAuthHandler = this.deleteAuthHandler.bind(this);
    }

    async postAuthHandler(request, h) {
        this._validator.validatePostAuthPayload(request.payload);

        const { username, password } = request.payload;
        const id = await this._usersService.verifyUserCredential(username, password);

        const accessToken = this._tokenManager.generateAccessToken({ id });
        const refreshToken = this._tokenManager.generateRefreshToken({ id });

        await this._authsService.addRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            message: 'Authentication berhasil ditambahkan',
            data: {
                accessToken,
                refreshToken,
            },
        });
        response.code(201);
        return response;
    }

    async putAuthHandler(request, h) {
        this._validator.validatePutAuthPayload(request.payload);

        const { refreshToken } = request.payload;
        await this._authsService.verifyRefreshToken(refreshToken);
        const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

        const  accessToken = this._tokenManager.generateAccessToken({ id });
        return {
            status: 'success',
            message: 'Access Token berhasil diperbarui',
            data: {
                accessToken,
            }
        };
    }

    async deleteAuthHandler(request, h) {
        this._validator.validateDeleteAuthPayload(request.payload);

        const { refreshToken } = request.payload;
        await this._authsService.verifyRefreshToken(refreshToken);
        await this._authsService.deleteRefreshToken(refreshToken);

        return {
            status: 'success',
            message: 'Refresh Token berhasil dihapus',
        };
    }
}

module.exports = AuthsHandler;