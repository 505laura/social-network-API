class HTTPError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
};

class NotFoundError extends HTTPError {
    constructor(message) {
        super(message, 404);
    }
}


module.exports = {HTTPError, NotFoundError};
