const express = require('express');
const app = express();
const gameController = require('./game');
const authenticatoinModel = require('../models/authenticationModel');
const imageModel = require('../models/imageModel');
const fs = require('fs');

let server;
/*
if (process.env.NODE_ENV === 'krul') {
    server = require('https').Server({
        key: fs.readFileSync('key/server.key'),
        cert: fs.readFileSync('key/server.cert')
    },app);
} else {*/
    server = require('http').Server(app);
// }
const io = require('socket.io')(server);
let port = (process.env.NODE_ENV === 'krul')? 11011: 3002;
server.listen(port);

io.sockets.on('connect', socket => {
    console.log('(game ready socket):  user connected on id ' + socket.id);
    socket.on('subscribe', data => {
        socket.join(data.room);
        console.log('(game ready socket): room - ' + data.room);
        io.in(data.room).emit('subscriptionSuccess', true);
    });
    socket.on('unsubscribe', data => {
        console.log('(game ready socket): leaving room - ' + data.room);
        socket.leave(data.room);
    });
    socket.on('playerReady', async data => {
        console.log(data);
        console.log('(game ready socket): getting game ' + data.game);
        let gamewrapper = await gameController.getGame(parseInt(data.game));
        let game = gamewrapper.game;
        console.log('(game ready socket): retrieving user role ' + data.channel);
        let sendInitialCountdown = false;
        let role = await authenticatoinModel.getRole(data.channel);
        if (role === 'guesser') {
            if (game.recommender.ready === true && game.guesser.ready === false) {
                sendInitialCountdown = true;
            }
            game.guesser.ready = true;
        } else {
            if (game.guesser.ready === true && game.recommender.ready === false) {
                sendInitialCountdown = true;
            }
            game.recommender.ready = true;
        }
        console.log(`(game ready socket): setting user ${role} ready for game ${game.gameId}`);
        if (game.guesser.ready === true && game.recommender.ready === true) {
            console.log(game);
            console.log('(game ready socket): emitting game start');
            this.sendState(game, {recommender: 'Recommend a segment.', guesser: 'Wait for a new segment.', recommender_boolean: true, guesser_boolean: false});
            io.in(game.guesser.userToken).in(game.recommender.userToken).emit('startGame', {});
            if (sendInitialCountdown === true) {
                this.updateTimer(game, 'inProgress');
            }
        }
    });
    socket.on('disconnect', () => console.log('(guess socket): a user disconnected on id ' + socket.id));
});

exports.getSocket = {
  socket: io
};

exports.sendSegments = async (request) => {
    let game;
    let gamewrapper;
    let segmentArray;
    try {
        console.log('(game ready socket) SEGMENTS, retrieving game');
        gamewrapper = await gameController.getGame(parseInt(request.params.gameId));
        game = gamewrapper.game;
        console.log('(game ready socket) SEGMENTS, emitting array');
        segmentArray = await imageModel.getSegmentMap(game.image);
    } catch (err) {
        console.log(err);
    }
    let numberOfSegments = 1;
    segmentArray.forEach(row => {
        if (row.length > 1) {
            numberOfSegments = Math.max(numberOfSegments, Math.max(...row.map(x => parseInt(x, 10))));
            game.numberOfSegments = numberOfSegments+1;
        }
       });
    let imageArray = [...Array(numberOfSegments+1).keys()];
    imageArray.push(-1);
    io.in(game.recommender.userToken).emit('newSegments', imageArray);
};

exports.sendRevealedSegments = (game) => {
    console.log('(game ready socket) SENDING REVEALED SEGMENTS');
    io.in(game.guesser.userToken).in(game.recommender.userToken).emit('revealedSegments', game.segments);
};

exports.finalRevelation = (game) => {
    console.log('(game ready socket) SENDING REVEALED SEGMENTS');
    io.in(game.guesser.userToken).in(game.recommender.userToken).emit('revealedSegments', [{segment: -2, timestamp: Date.now()}]);
};

exports.sendRecentGuesses = (game) => {
    console.log('(game ready socket) SENDING RECENT GUESSES');
    io.in(game.guesser.userToken).in(game.recommender.userToken).emit('recentGuesses', game.guesses);
};

exports.sendScore = (game) => {
    console.log('(game ready socket) SENDING CURRENT SCORE');
    io.in(game.guesser.userToken).in(game.recommender.userToken).emit('currentScore', this.getScore(game.turn) );
};

exports.sendState = (game, state) => {
    console.log('(game ready socket) SENDING CURRENT SCORE');
    io.in(game.guesser.userToken).emit('currentState', {state: state.guesser, boolean: state.guesser_boolean});
    io.in(game.recommender.userToken).emit('currentState', {state: state.recommender, boolean: state.recommender_boolean})
};

exports.finish = (game) => {
    console.log('(game ready socket) SENDING FINISH');
    authenticatoinModel.getToken(game.guesser.userId, 'none', 0, 0, game.guesser.sessionId, 'none').then(guesser_payload => {
        io.in(game.guesser.userToken).emit('finish', {gameover: true, token: guesser_payload.idToken});
    });
    authenticatoinModel.getToken(game.recommender.userId, 'none', 0, 0, game.recommender.sessionId, 'none').then(recommender_payload => {
        io.in(game.recommender.userToken).emit('finish', {gameover: true, token: recommender_payload.idToken});
    });
    this.updateTimer(game, 'end');
};

exports.finalRound = (game, token) => {
    io.in(game.guesser.userToken).emit('finish', {gameover: false, token: token});
};

exports.quit = (game, role) => {
    console.log('(game ready socket) SENDING QUIT');
    this.updateTimer(game, 'end');
    if (role === 'recommender') {
        authenticatoinModel.getToken(game.guesser.userId, 'none', 0, 0, game.guesser.sessionId, 'none').then(payload => {
            io.in(game.guesser.userToken).emit('quit', {gameover: true, token: payload.idToken});
        });
    }
    if (role === 'guesser') {
        authenticatoinModel.getToken(game.recommender.userId, 'none', 0, 0, game.recommender.sessionId, 'none').then(payload => {
            io.in(game.recommender.userToken).emit('quit', {gameover: true, token: payload.idToken});
        });
    }
    if (role === 'timeout') {
            authenticatoinModel.getToken(game.recommender.userId, 'none', 0, 0, game.recommender.sessionId, 'none').then(payload_recommender => {
                io.in(game.recommender.userToken).emit('timeout', {gameover: true, token: payload_recommender.idToken});
            });
            authenticatoinModel.getToken(game.guesser.userId, 'none', 0, 0, game.guesser.sessionId, 'none').then(payload => {
                io.in(game.guesser.userToken).emit('timeout', {gameover: true, token: payload.idToken});
            });
    }
};

exports.updateTimer = (game, state) => {
    console.log('(game ready socket) SENDING TIMER');
    io.in(game.guesser.userToken).in(game.recommender.userToken).emit('countdown', {time: Date.now(), state: state});
};

exports.getScore = (turn) => {
    return Math.pow(1.0311772746, turn).toFixed(2);
};