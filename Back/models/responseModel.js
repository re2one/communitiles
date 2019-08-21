// responds with status 200: OK
exports.sendOk = function (response, responseBody) {
    response.status(200).json(responseBody);
};

// responds with status 201: Created
exports.sendCreated = function (response, responseBody) {
    response.status(201).json(responseBody);
};

// responds with status 400: bad request
exports.sendBadRequest = function (request, response, message) {
    response.status(400).json({
        status: 'Bad Request',
        message: message,
        data: request.body
    });
};

// responds with status 401: unauthorized
exports.sendStatusUnauthorized = function (request, response, message) {
    response.status(401).json({
        status: 'Unauthorized',
        message: message,
        data: request.body
    });
};

// responds with status 404: Not Found
exports.sendNotFound = function (request, response, message) {
    response.status(404).json({
        status: 'Not Found',
        message: message,
        data: request.body
    });
};

// responds with status 500: internal server error
exports.sendInternalServerError = function (request, response, message) {
    response.status(500).json({
        status: 'Internal Server Error',
        message: message,
        data: request.body
    });
};
