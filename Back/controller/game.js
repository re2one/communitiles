const gameModel = require('../models/gameModel');
const timerSocket = require('./timersocket');
require('rxjs/add/observable/of');
const imageModel = require('../models/imageModel');
const authenticatoinModel = require('../models/authenticationModel');

let games = new Map();

function GameWrapper (game) {
    this.game = game;
    this.observer = {
        async next (type, inputGame, input, request) {
            if (type === 'guess') {
                inputGame.guesses.push(input);
                console.log(inputGame.turn);
                inputGame.turn = inputGame.turn-1;
                console.log(inputGame.turn);
                timerSocket.sendScore(inputGame, inputGame.turn);
                let turns = ((inputGame.turn-1)%3)+1;
                if (inputGame.turn%3 === 0) {
                    inputGame.movingPlayer = 'recommender';
                    timerSocket.sendState(inputGame, {recommender: 'Recommend a segment.', recommender_boolean: true, guesser_boolean: false, guesser: 'Wait for a new segment.', type: 'guess'});
                } else {
                    let recommender_message = (turns === 1)? 'Wait for 1 more guess.': `Wait for ${turns} more guesses.`;
                    let guesser_message = (turns === 1)? 'Submit 1 more guess.': `Submit ${turns} more guesses.`;
                    timerSocket.sendState(inputGame, {recommender: recommender_message, recommender_boolean: false, guesser_boolean: true, guesser: guesser_message});
                }
                if (inputGame.turn < 76) {
                    let auth = request.headers.authorization;
                    inputGame.movingPlayer = 'guesser';
                    let userId;
                    let role;
                    let imageId;
                    let gameId;
                    let session;
                    try {
                        userId = await authenticatoinModel.getUserId(auth);
                        role = await authenticatoinModel.getRole(auth);
                        imageId = await authenticatoinModel.getImage(auth);
                        gameId = await authenticatoinModel.getGame(auth);
                        session = await authenticatoinModel.getSession(auth);
                    } catch (error) {
                        console.log(error);
                    }
                    authenticatoinModel.getToken(
                        userId,
                        role,
                        imageId,
                        gameId,
                        session,                           
                        'finalRound'
                    ).then(token => {
                        timerSocket.finalRound(inputGame, token.idToken);
                        timerSocket.updateTimer(inputGame, 'inProgress');
                        timerSocket.finalRevelation(inputGame);
                        let recommender_message = (turns === 1)? 'Wait for the final guess.': `Wait for the final ${turns} guesses.`;
                        let guesser_message = (turns === 1)? 'Submit 1 final guess.': `Submit ${turns} final guesses.`;
                        timerSocket.sendState(inputGame, {recommender: recommender_message, recommender_boolean: false, guesser_boolean: true, guesser: guesser_message});
                    });
                }
                timerSocket.updateTimer(inputGame, 'inProgress');
            } else if (type === 'recommendation') {
                inputGame.segments.push(input);
                inputGame.movingPlayer = 'guesser';
                let turns = ((inputGame.turn-1)%3)+1;
                let recommender_message = (turns === 1)? 'Wait for 1 more guess.': `Wait for ${turns} guesses.`;
                let guesser_message = (turns === 1)? 'Submit 1 more guess.': `Submit ${turns} more guesses.`;
                timerSocket.sendState(inputGame, {recommender: recommender_message, guesser: guesser_message, recommender_boolean: false, guesser_boolean: true});
                timerSocket.updateTimer(inputGame, 'inProgress');
            } else if (type === 'skip') {
                do {
                    inputGame.turn = inputGame.turn-1;
                } while (inputGame.turn%3 !== 0);
                inputGame.guesses.push({type: 'skip', guess: '', timestamp: Date.now()});
                console.log(inputGame.turn);
                timerSocket.sendScore(inputGame, inputGame.turn);
                let turns = ((inputGame.turn-1)%3)+1;
                if (inputGame.turn < 76) {
                    let auth = request.headers.authorization;
                    inputGame.movingPlayer = 'guesser';
                    let userId;
                    let role;
                    let imageId;
                    let gameId;
                    let session;
                    try {
                        userId = await authenticatoinModel.getUserId(auth);
                        role = await authenticatoinModel.getRole(auth);
                        imageId = await authenticatoinModel.getImage(auth);
                        gameId = await authenticatoinModel.getGame(auth);
                        session = await authenticatoinModel.getSession(auth);
                    } catch (error) {
                        console.log(error);
                    }
                    authenticatoinModel.getToken(
                        userId,
                        role,
                        imageId,
                        gameId,
                        session,                           
                        'finalRound'
                    ).then(token => { 
                            timerSocket.finalRound(inputGame, token.idToken);
                            timerSocket.updateTimer(inputGame, 'inProgress');
                            timerSocket.finalRevelation(inputGame);
                            let recommender_message = (turns === 1)? 'Wait for the final guess.': `Wait for the final ${turns} guesses.`;
                            let guesser_message = (turns === 1)? 'Submit 1 final guess.': `Submit ${turns} final guesses.`;
                            timerSocket.sendState(inputGame, {recommender: recommender_message, recommender_boolean: false, guesser_boolean: true, guesser: guesser_message});
                        });        
                   } else {
                    inputGame.movingPlayer = 'recommender';
                    timerSocket.sendState(inputGame, {
                        recommender: 'The guesser has skipped. Reveal one more Segment.',
                        recommender_boolean: true,
                        guesser_boolean: false,
                        guesser: 'Wait for a new segment.'
                    });
                }
                timerSocket.updateTimer(inputGame, 'inProgress');
            } else if (type === 'miss_recommender') {
                let randomSegments = [...Array(inputGame.numberOfSegments).keys()].filter(x => !inputGame.segments.map(x => x.segment).includes(x));
                let segment = randomSegments[Math.floor(Math.random() * randomSegments.length)];
                inputGame.segments.push({segment: segment, timestamp: input.timestamp, type: 'missed recommendation'});
                inputGame.movingPlayer = 'guesser';
                timerSocket.sendRevealedSegments(inputGame);
                let turns = ((inputGame.turn-1)%3)+1;
                // let recommender_message = (turns === 1)? 'Wait for 1 more guess.': `Wait for ${turns} more guesses.`;
                let guesser_message = (turns === 1)? 'Time ran out. Submit 1 more guess.': `Time ran out. Submit ${turns} more guesses.`;
                timerSocket.sendState(inputGame, {recommender: 'You missed. A random segment has been revealed.', recommender_boolean: false, guesser_boolean: true, guesser: guesser_message});
                timerSocket.updateTimer(inputGame, 'inProgress');
            } else if (type === 'miss_guesser') {
                inputGame.turn = inputGame.turn-1;
                inputGame.guesses.push({timestamp: Date.now(), guess: null, type: 'missed guess'});
                timerSocket.sendScore(inputGame, inputGame.turn);
                timerSocket.sendRecentGuesses(inputGame);
                let turns = ((inputGame.turn-1)%3)+1;
                if (inputGame.turn%3 === 0) {
                    inputGame.movingPlayer = 'recommender';
                    timerSocket.sendState(inputGame, {recommender: 'The guesser missed. Reveal one more Segment.', recommender_boolean: true, guesser_boolean: false, guesser: 'You missed. Wait for a new segment.'});
                } else {
                    let recommender_message = (turns === 1)? 'Wait for 1 more guess.': `Wait for ${turns} more guesses.`;
                    let guesser_message = (turns === 1)? 'Time ran out. Submit 1 more guess.': `Time ran out. Submit ${turns} more guesses.`;
                    timerSocket.sendState(inputGame, {recommender: recommender_message, recommender_boolean: false, guesser_boolean: true, guesser: guesser_message});
                }
                if (inputGame.turn < 76) {
                    let auth = request.headers.authorization;
                    inputGame.movingPlayer = 'guesser';
                    let userId;
                    let role;
                    let imageId;
                    let gameId;
                    let session;
                    try {
                        userId = await authenticatoinModel.getUserId(auth);
                        role = await authenticatoinModel.getRole(auth);
                        imageId = await authenticatoinModel.getImage(auth);
                        gameId = await authenticatoinModel.getGame(auth);
                        session = await authenticatoinModel.getSession(auth);
                    } catch (error) {
                        console.log(error);
                    }
                    authenticatoinModel.getToken(
                        userId,
                        role,
                        imageId,
                        gameId,
                        session,                           
                        'finalRound'
                    ).then(token => {
                            timerSocket.finalRound(inputGame, token.idToken);
                            timerSocket.updateTimer(inputGame, 'inProgress');
                            timerSocket.finalRevelation(inputGame);
                            let recommender_message = (turns === 1)? 'Wait for the final guess.': `Wait for the final ${turns} guesses.`;
                            let guesser_message = (turns === 1)? 'Submit 1 final guess.': `Submit ${turns} final guesses.`;
                            timerSocket.sendState(inputGame, {recommender: recommender_message, recommender_boolean: false, guesser_boolean: true, guesser: guesser_message});
                        });                
                   }
                timerSocket.updateTimer(inputGame, 'inProgress');
            }
        },
        error () {

        },
        async complete (type, inputGame, input, request) {
            if (type!== 'quit') inputGame.guesses.push({timestamp: input.timestamp, type: 'guess', guess: input.guess});
            try {
                await asyncForEach(inputGame.guesser.userId, 'guesser','guess', inputGame.gameId, inputGame.guesses, gameModel.addAction);
                await asyncForEach(inputGame.recommender.userId, 'recommender', 'recommendation', inputGame.gameId, inputGame.segments, gameModel.addAction);
                await gameModel.addAction(null, 'system', inputGame.start, 'startOfGame', null, inputGame.gameId);
                await gameModel.addAction(inputGame[input.role].userId, input.role, new Date(), 'endOfGame', type, inputGame.gameId);
            } catch (error) {
                console.log(error);
            }
            console.log('del fin');
            if (type === 'regular' || type === 'accept') timerSocket.finish(inputGame);
            if (type === 'quit') timerSocket.quit(inputGame, input.role);
            if (type === 'timeout') timerSocket.quit(inputGame, 'timeout');
            //TODO: batch write game log
        }
    }
}

exports.newGame = async (guesser, recommender, image) => {
    let game;
    let gamewrapper;
    try {
        console.log('(game controller): creating new Game Object');
        game = await gameModel.newGame(guesser, recommender, image);
        gamewrapper = new GameWrapper(game);
        console.log('(game controller): new game - ' + JSON.stringify(game) );
    }
    catch(error) {
        throw error;
    } finally {
        console.log('(game controller): adding Game Object to game collection');
        games.set(gamewrapper.game.gameId, gamewrapper);
        console.log('(game controller): game collection size - ' + [...games.entries()].length);
    }
    return gamewrapper.game.gameId;
};

exports.getGame = (gameId) => {
    console.log('(game controller): getting Game ' + gameId);
    return new Promise (resolve => {
        let result = games.get(gameId);
        resolve(result);
    });
};

exports.setToken = (gameId, guesser, recommender) => {
    let gamewrapper = games.get(gameId);
    gamewrapper.game.recommender = recommender;
    gamewrapper.game.guesser = guesser;
    games.set(gameId, gamewrapper);
};

exports.setSegments = async (gameId, request) => {
    let gamewrapper = games.get(gameId);
    try {
        await gamewrapper.observer.next('recommendation', gamewrapper.game, {segment: request.body.segment, type: 'recommendation', timestamp: request.body.timestamp}, request);
    } catch (error) {
        console.log(error);
    }
};

exports.setGuess = async (gameId, request) => {
    let gamewrapper = games.get(gameId);
    let dimension;
    try {
        dimension = await imageModel.getImageDimension(gamewrapper.game.image);
        // if (dimension.dimensions.label.map(x => x.label).includes(request.body.guess)) {
        if (dimension.dimensions.synonyms.includes(request.body.guess)) {
            await gamewrapper.observer.complete('regular', gamewrapper.game, {role: 'guesser', guess: request.body.guess, timestamp: request.body.timestamp}, request);
            return true;
        } else if (!dimension.dimensions.synonyms.includes(request.body.guess) && gamewrapper.game.turn < 74) {
            await gamewrapper.observer.complete('timeout', gamewrapper.game, {role: 'guesser', guess: request.body.guess, timestamp: request.body.timestamp}, request);
            return true;
        } else {
            await gamewrapper.observer.next('guess', gamewrapper.game, {guess: request.body.guess, type: 'guess', timestamp: request.body.timestamp}, request);
            return false;
        }
    } catch (err) {
        console.log(err);
    }
};

exports.getMovingPlayer = (gameId) => {
  return new Promise ( resolve => {
    let gamewrapper = games.get(gameId);
    resolve(gamewrapper.game.movingPlayer);
  });
};

exports.skip = async (gameId, request) => {
    let gamewrapper = games.get(gameId);
    let dimension;
    try {
        await gamewrapper.observer.next('skip', gamewrapper.game, {timestamp: request.body.timestamp}, request);
        dimension = await imageModel.getImageDimension(gamewrapper.game.image);
        if(!dimension.dimensions.label.map(x => x.label).includes(request.body.guess) && gamewrapper.game.turn < 74) {
            await gamewrapper.observer.complete('timeout', gamewrapper.game, {role: 'guesser', guess: request.body.guess, timestamp: request.body.timestamp}, request);
        }
    } catch (err) {
        console.log(err);
    }
};

exports.miss = async (gameId, role, request) => {
    let gamewrapper = games.get(gameId);
    let dimension;
    try {
        dimension = await imageModel.getImageDimension(gamewrapper.game.image);
        if(!dimension.dimensions.label.map(x => x.label).includes(request.body.guess) && gamewrapper.game.turn < 74) {
            await gamewrapper.observer.complete('timeout', gamewrapper.game, {role: 'guesser', guess: request.body.guess, timestamp: request.body.timestamp}, request);
        } else {
            await gamewrapper.observer.next('miss_' + role, gamewrapper.game, {timestamp: request.body.timestamp}, request);
        }
    } catch (err) {
        console.log(err);
    }
};

exports.quit = async (gameId, role, request) => {
    let gamewrapper = games.get(gameId);
    try {
        await gamewrapper.observer.complete('quit', gamewrapper.game, {role: role, timestamp: request.body.timestamp}, request);
    } catch (error) {
        console.log(error);
    }
    this.deleteGame(gamewrapper.game);
};

exports.deleteGame = (gameId) => {
    games.delete(gameId);
};

exports.containsGame = (gameId) => {
  return new Promise (resolve => {
      resolve(Array.from(games.keys()).includes(gameId));
  });
};

async function asyncForEach(userId, user, transaction, gameId, input, callback) {
    for (let i = 0; i < input.length; i++) {
        let value;
        switch (input[i].type) {
            case 'guess':
                value = input[i].guess;
                break;
            case 'recommendation':
                value = input[i].segment;
                break;
            case 'missed recommendation':
                value = input[i].segment;
                break;
            case 'missed guess':
                value = null;
                break;
            case 'skip':
                value = null;
                break;
        }
        try {
            await callback(userId, user, new Date(input[i].timestamp), input[i].type, value, gameId);
        } catch (error) {
            console.log(error);
        }
    }
}