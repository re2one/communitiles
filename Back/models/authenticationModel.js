const jwt = require('jsonwebtoken');
const fs = require('fs');
const pool = require('../connection/connection');
const bcrypt = require('bcryptjs');
const expressJwt = require('express-jwt');

const RSA_PRIVATE_KEY = fs.readFileSync('./key/jwtRS256.key', 'utf-8');
const RSA_PUBLIC_KEY = fs.readFileSync('./key/jwtRS256.key.pub', 'utf-8');

// signs and returns a json webtoken for given userId
// userId: Id of user stored in database
exports.getToken = function(userId, role, imageId, gameId, sessionId, gameState) {
    let expiresAt = new Date(); // Epoch
    let seconds = Math.floor(Date.now() / 1000) + (2 * 60 * 60); // 2 hours from now
    expiresAt.setSeconds(seconds);
    return new Promise( resolve => {
        let token = jwt.sign(
            {
                exp: seconds
            },
            RSA_PRIVATE_KEY,
            {
                algorithm: 'RS256',
                subject: JSON.stringify({
                    userId: userId.toString(),
                    role: role,
                    gameId: gameId,
                    imageId: imageId,
                    timeOfOrigin: Date.now(),
                    sessionId: sessionId,
                    gameState: gameState
                })
            }
        );
        result = {
            idToken: token,
            expiresAt: expiresAt,
            role: role,
            imageId: imageId,
            gameId: gameId
        };
        resolve(result);
    });
};

exports.checkIfAuthenticated = expressJwt({
    secret: RSA_PUBLIC_KEY
});

// unsigns a given authorization token to retrieve its userId
// authorization: request.headers.authorization
exports.getUserId = function(authorization) {
    return new Promise(resolve => {
        let token = authorization.replace('Bearer ', '');
        let decoded = jwt.verify(token, RSA_PUBLIC_KEY, {
            algorithm: ['RS256']
        });
        let parsedSubject = JSON.parse(decoded.sub);
        console.log('(authModel, parsed subject): ' + JSON.stringify(parsedSubject));
        let userId = parsedSubject.userId;
        resolve(userId);
    });
};

exports.getRole = function(authorization) {
    return new Promise(resolve => {
        let token = authorization.replace('Bearer ', '');
        let decoded = jwt.verify(token, RSA_PUBLIC_KEY, {
            algorithm: ['RS256']
        });
        let parsedSubject = JSON.parse(decoded.sub);
        console.log('(authModel, parsed subject): ' + JSON.stringify(parsedSubject));
        let role = parsedSubject.role;
        resolve(role);
    });
};

exports.getImage = function(authorization) {
    return new Promise(resolve => {
        let token = authorization.replace('Bearer ', '');
        let decoded = jwt.verify(token, RSA_PUBLIC_KEY, {
            algorithm: ['RS256']
        });
        let parsedSubject = JSON.parse(decoded.sub);
        console.log('(authModel, parsed subject): ' + JSON.stringify(parsedSubject));
        let imageId = parsedSubject.imageId;
        resolve(imageId);
    });
};

exports.getGame = function(authorization) {
    return new Promise (resolve => {
        let token = authorization.replace('Bearer ', '');
        let decoded = jwt.verify(token, RSA_PUBLIC_KEY, {
            algorithm: ['RS256']
        });
        let parsedSubject = JSON.parse(decoded.sub);
        console.log('(authModel, parsed subject): ' + JSON.stringify(parsedSubject));
        let gameId = parsedSubject.gameId;
        resolve(gameId);
    });
};

exports.getSession = function(authorization) {
    return new Promise (resolve => {
        let token = authorization.replace('Bearer ', '');
        let decoded = jwt.verify(token, RSA_PUBLIC_KEY, {
            algorithm: ['RS256']
        });
        let parsedSubject = JSON.parse(decoded.sub);
        console.log('(authModel, parsed subject): ' + JSON.stringify(parsedSubject));
        let sessionId = parsedSubject.sessionId;
        resolve(sessionId);
    });
};

exports.getState = function(authorization) {
    return new Promise ( resolve => {
        let token = authorization.replace('Bearer ', '');
        let decoded = jwt.verify(token, RSA_PUBLIC_KEY, {
            algorithm: ['RS256']
        });
        let parsedSubject = JSON.parse(decoded.sub);
        console.log('(authModel, parsed subject): ' + JSON.stringify(parsedSubject));
        let state = parsedSubject.gameState;
        resolve (state);
    });
};

exports.checkRole = async function(request) {
    let tmp = request.params[0].split('/')[0];
    let role = await this.getRole(request.headers.authorization); 
    let result = false;
    if (tmp === 'recommending' && role === 'recommender') {
        result = true;
    } else if (tmp === 'guessing' && role === 'guesser') {
        result = true;
    } else  if(tmp !== 'guessing' && tmp !== 'recommending') {
        result = true;
    }
    return result;
};
// gets a user object if the given user is authorized, null otherwise
// email: Users email as stored in database
// password: Users password which is stored as a hashed value in database
exports.getValidatedUser = async function(email, password) {
    let user;
    let connection;
    try {
        connection = await pool.getConnection();
        let rows = await connection.query('CALL GetValidatedUser(?, ?);', [email, password]);
        user = rows[0][0];
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection){
            connection.end();
        }
    }
    return user;
};
