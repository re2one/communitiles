const rx = require ('rxjs');
require('rxjs/add/observable/of');
const gameController = require('../controller/game');
const authModel = require('../models/authenticationModel');
const timersocket = require('./timersocket');
const gameModel = require('../models/gameModel');

/*
// login function: create and return an authorization token if email and password are valid
exports.getMock = function(request, response) {
    console.log('(guessing controller): retreiving timer');
    console.log('(guessing controller): ' + request.params.gameId);
    const game = gameController.getGame(parseInt(request.params.gameId)).game;
    console.log('(guessing controller HIER): ' + JSON.stringify(game));
    // const timingObs = gameController.getGame(request.params.gameId).timer.timingObservable;
    response.status(200).json({answer: game});
    // console.log('(guessing controller): start observing timer');
    // rx.Observable.subscribe(timingObs);
};
*/

exports.skip = async function(request, response) {
    console.log('(guessing controller): skip');
    let gameId;
    let success = false;
    try {
        gameId = await authModel.getGame(request.headers.authorization);
        let movingPlayer = await gameController.getMovingPlayer(gameId);
        if (movingPlayer === 'guesser') {
            await gameController.skip(gameId, request);
            success = true;
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

exports.guess = async function(request, response) {
    console.log('(guessing controller): push');
    let gameId;
    let game;
    let gamewrapper;
    let success = false;
    try {
        gameId = await authModel.getGame(request.headers.authorization);
        let movingPlayer = await gameController.getMovingPlayer(gameId);
        if (movingPlayer === 'guesser') {
            let finish = await gameController.setGuess(gameId, request);
            gamewrapper = await gameController.getGame(gameId);
            game = gamewrapper.game;
            timersocket.sendRecentGuesses(game);
            if (finish) {
                try{
                    let score = timersocket.getScore(game.turn);
                    score = await gameModel.addScore(gameId, score);
                } catch (err) {
                    console.log(err);
                }
                gameController.deleteGame(game.gameId);
            }
            success = true;
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