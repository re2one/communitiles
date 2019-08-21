const gameController = require('../controller/game');
const gameModel = require('../models/gameModel');
const authModel = require('../models/authenticationModel');
const pairingModel = require('../models/pairingModel');
const timerSocket = require('../controller/timersocket');

exports.miss = async function(request, response) {
    console.log('(common controller): miss');
    let gameId;
    let role;
    let success = false;
    // let success = false;
    try {
        gameId = await authModel.getGame(request.headers.authorization);
        role = await authModel.getRole(request.headers.authorization);
        let containsGame = await gameController.containsGame(gameId);
        if (containsGame) {
            let movingPlayer = await gameController.getMovingPlayer(gameId);
            if (movingPlayer === role) {
                await gameController.miss(gameId, role, request);
                success = true;
            }
        }
    } catch (err){
        console.log(err);
    }
    if (success === true) {
        response.status(200).json({});
    } else {
        response.status(400).json({});
    }
};

exports.quit = async function(request, response) {
    console.log('(common controller): quit');
    let success = false;
    let gameId;
    let role;
    let gamewrapper;
    let score;
    let userId;
    try {
        userId = await authModel.getUserId(request.headers.authorization);
        let containsUser = await pairingModel.containsUser(userId);
        if (containsUser) {
            pairingModel.removeUser(userId);
            success = true;
        }
        gameId = await authModel.getGame(request.headers.authorization);
        gamewrapper = await gameController.getGame(gameId);
        let containsGame = await gameController.containsGame(gameId);
        if (containsGame) {
            role = await authModel.getRole(request.headers.authorization);
            score = timerSocket.getScore(gamewrapper.game.turn);
            await gameModel.addScore(gameId, score);
            await gameController.quit(gameId, role, request);
            success = true;
        }
    } catch (error) {
        console.log(error);
    }
    if (success === true) {
        response.status(200).json({});
    } else {
        response.status(400).json({});
    }
};
