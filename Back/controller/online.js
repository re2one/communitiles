const onlineModel = require('../models/onlineModel');
const userModel = require('../models/userModel');
const responseModel = require('../models/responseModel');
const authModel = require('../models/authenticationModel');
const sessionModel = require('../models/sessionModel');

const fs = require('fs');

const app = require('express')();
let server;
/*
if (process.env.NODE_ENV === 'krul') {
    server = require('https').Server({
        key: fs.readFileSync('key/server.key'),
        cert: fs.readFileSync('key/server.cert')
    },app);
} else {*/
    server = require('http').Server(app);
//}
const io = require('socket.io')(server);

let port = (process.env.NODE_ENV === 'krul')? 11010: 3001;
server.listen(port);

io.on('connection', function (socket) {
    console.log('(online socket): a user connected on id ' + socket.id);
    const len = onlineModel.getSize();
    socket.emit('playerUpdate', {playerCount: `${len}`});
    socket.on('disconnect', () => console.log('(online socket): a user disconnected on id ' + socket.id));
});


exports.logUser = async function(request, response){
    let len;
    let user;
    let userId;
    try {
        userId = await authModel.getUserId(request.headers.authorization);
        user = await userModel.getUser(userId, request.headers.authorization);
        len = await onlineModel.logUser(user);
    } catch(error) {
        console.log(error);
    } finally {
        io.sockets.emit('playerUpdate', {playerCount: `${len}`});
        responseModel.sendOk(response, {});
    }
};

/*
exports.logUserOut = async function(request, response){
    let len;
    let user;
    let userId
    let loggedIn;
    let len;
    console.log("==== online controller ====");
    try {
        userId = await authModel.getUserId(request.headers.authorization);
        console.log("==== online controller ====");
        console.log(userId);
        user = await userModel.getUser(userId, request.headers.authorization);
        console.log("==== online controller ====");
        console.log(user);
        loggedIn = await onlineModel.isLoggedIn(user.userId);
        console.log("==== online controller ====");
        console.log(loggedIn);
        if (loggedIn) {
            let sessionId = await authModel.getSession(request.headers.authorization);
            console.log("==== online controller ====");
            console.log(sessionId);
            await sessionModel.addSessionEnd(sessionId, new Date());
            len = await onlineModel.logUserOut(user);
            console.log("==== online controller ====");
            console.log(len);
            io.sockets.emit('playerUpdate', {playerCount: `${len}`});
            responseModel.sendOk(response, {});
        } else {
            responseModel.sendBadRequest(request, response, {});
        }
    } catch(error) {
        console.log(error);
    }
};
*/

exports.logUserOut = async function(request, response){
    let len;
    let user;
    let isLoggedIn;
    let userId;
    try {
        userId = await authModel.getUserId(request.headers.authorization);
        user = await userModel.getUser(userId, request.headers.authorization);
        isLoggedIn = await onlineModel.isLoggedIn(user.userId);
    } catch(error) {
        console.log(error);
    } finally {
        if (isLoggedIn) {
            try {
                let sessionId = await authModel.getSession(request.headers.authorization);
                await sessionModel.addSessionEnd( sessionId, new Date());
                len = await onlineModel.logUserOut(user);
            } catch (error) {
                console.log(error);
            }
            io.sockets.emit('playerUpdate', {playerCount: `${len}`});
            responseModel.sendOk(response, {});
        } else {
            responseModel.sendBadRequest(request, response, {});
        }
    }
};

