const userModel = require('../models/userModel');
const responseModel = require('../models/responseModel');
const authModel = require('../models/authenticationModel');
const pairingModel = require('../models/pairingModel');
const rx = require ('rxjs');
require('rxjs/add/observable/of');

exports.addUser = async function(request, response){
    let user;
    let userId;
    try {
        console.log('(pairing controller): start, decoding user id');
        userId = await authModel.getUserId(request.headers.authorization);
        console.log(`(pairing controller): retreiving model for user ${userId}`);
        user = await userModel.getUser(userId, request.headers.authorization);
    } catch(error) {
        console.log(error);
    } finally {
        console.log(`(pairing): retreivec user ${JSON.stringify(user)}`);
        console.log('(pairing controller): adding http response to user model');
        user.response = response;
        console.log('(pairing controller): initializing incompatible users with himself');
        user.incompatibles = new Array(userId);
        console.log('(pairing controller): subscribing to pairingObservable with user');
        rx.Observable.of(user).subscribe(pairingModel.pairingObservable);
    }
};
