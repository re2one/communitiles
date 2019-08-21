const express = require('express');
const authenticationModel = require('../models/authenticationModel');
const responseModel = require('../models/responseModel');
const onlineModel = require('../models/onlineModel');
const sessionModel = require('../models/sessionModel');

const app = express();
app.use(express.json());

// login function: create and return an authorization token if email and password are valid
exports.login = async function(request, response) {

    // input ok -> lets go
    let email = request.body.email;
    let password = request.body.password;
    let user;
    let loggedIn;
    // console.log(request.body);
    try{
        // validate email and password with database
        user = await authenticationModel.getValidatedUser(email, password);
        loggedIn = await onlineModel.isLoggedIn(user.UserId.toString());
    } catch(error) {
        let errorMessage = error.name + ': ' + error.message;
        responseModel.sendInternalServerError(request, response, errorMessage);
    }
    if(user && !loggedIn){
        let userId = user.UserId;
        let sessionId;
        try {
            sessionId = await sessionModel.newSession(userId);
            await sessionModel.addSessionStart(sessionId, new Date());
        } catch (error) {
            console.log(error);
        }
        authenticationModel.getToken(userId, 'none', 0, 0, sessionId, 'none').then(login => {
            responseModel.sendOk(response, login);
        });
    }
    else {
        responseModel.sendStatusUnauthorized(request, response, 'Email or password is incorrect!');
    }
};