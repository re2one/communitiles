const express = require('express');
const signupModel = require('../models/signupModel');
const responseModel = require('../models/responseModel');

const app = express();
app.use(express.json());

// login function: create and return an authorization token if email and password are valid
exports.signup = async function(request, response) {

    // input ok -> lets go
    let username = request.body.username;
    let email = request.body.email;
    let password = request.body.password;
    let result;
    try {
        console.log(request.body)

        // validate email and password with database
        result = await signupModel.postNewUser(username, email, password);
    } catch (error) {
        console.log(error);
    }

    if(result){
        responseModel.sendCreated(response, request.body);
    } else {
        responseModel.sendBadRequest(request, response, 'Something went wrong!');
    }
};
