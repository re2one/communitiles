const express = require('express');
const timerSocket = require('./timersocket');
const authenticatoinModel = require('../models/authenticationModel');
const pool = require('../connection/connection');
const gameController = require('../controller/game');
const gameModel = require('../models/gameModel');

const app = express();
app.use(express.json());

// login function: create and return an authorization token if email and password are valid
exports.initSegments = async function(request, response) {
    console.log('(recommending controller): init Segments');
    timerSocket.sendSegments(request);
    response.status(200).json({answer: 'success!'});
};

exports.setSegments = async function(request, response) {
    let game;
    let gamewrapper;
    let gameId;
    let success = false;
    let token;
    try {
        let auth = request.headers.authorization;
        gameId = await authenticatoinModel.getGame(auth);
        let movingPlayer = await gameController.getMovingPlayer(gameId);
        if (movingPlayer === 'recommender') {
            gamewrapper = await gameController.getGame(gameId);
            game = gamewrapper.game;
            await gameController.setSegments(gameId, request);
            success = true;
        }
    } catch (error) {
        console.log(error);
    }
    timerSocket.sendRevealedSegments(game);
    if (success === true) {
        response.status(200).json({});
    } else {
        response.status(400).json({});
    }
};

exports.accept = async function (request, response) {
    let auth = request.headers.authorization;
    let role;
    try {
        role = await authenticatoinModel.getRole(auth);
        if ('recommender' === role) {
            let gameId = await authenticatoinModel.getGame(auth);
            let gamewrapper = await gameController.getGame(gameId);
            let game = gamewrapper.game;
            gamewrapper.observer.complete('accept', game, {role: 'recommender'}, request);
            let score = timerSocket.getScore(game.turn);
            score = await gameModel.addScore(gameId, score);
            gameController.deleteGame(game.gameId);
            response.status(200).json({});
        }
    } catch (error) {
        console.log(error);
    }
};