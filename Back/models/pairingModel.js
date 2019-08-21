const rx = require ('rxjs');
require('rxjs/add/observable/of');
const auth = require('./authenticationModel');
const gameController = require('../controller/game');

let pairingPool = new Map();

/**
 * get array of keys from map
 * iterate
 *  assign map.value to var user by current key
 *  compute difference of pairingPool keys and user.incompatibles keys
 *      if < 1: next user
 *      else:
 *          assign map.value to opponent by random key of difference
 *          compute intersection of unplayed images
 *              if > 0: chose random image and pair, then remove user and opponent from map, start from beginning
 *              else: add opponent to user.incompatibles and vice versa, start from beginning
 * assign true to endOfPairingRun
 *
 */

exports.pairingObservable = {
    /*
    next (user) {
        console.log('(pairing model): start of observable');
        // console.log(`(pairing model): adding ${JSON.stringify(user)} to pairing pool`);
        pairingPool.set(user.userId, user);
        // console.log(`(pairing model): new pool size: ${pairingPool.size}`);
        let endOfPairingRun = false;
        // console.log('(pairing model): trying to start pairing loop');
        while (pairingPool.size > 1 && endOfPairingRun !== true) {
            // console.log(`(pairing model): success. pool size: ${pairingPool.size} > 1, starting pairing`);
            let pairableUser = [...pairingPool.keys()];
            // console.log(`(pairing model): current playerpool - ${pairableUser}`);
            do {
                let p = pairableUser[getRandomInt(pairableUser.length)];
                let user = pairingPool.get(p);
                if (user) {
                    let possibleOpponents;
                    do {
                        // console.log(`(pairing model): currently evaluated user - ${user.userId}`);
                        // console.log(`(pairing model): incompatible user - ${user.incompatibles}`);
                        possibleOpponents = pairableUser.filter(x => !user.incompatibles.includes(x));
                        // console.log(`(pairing model): possible opponents - ${possibleOpponents}`);
                        if (possibleOpponents.length > 0) {
                            let opponent = pairingPool.get(possibleOpponents[getRandomInt(possibleOpponents.length)]);
                            if  (opponent) {
                                // console.log(`(pairing model): currently evaluated opponent - ${opponent.userId}`);
                                const imageIntersection = user.images.filter(x => opponent.images.includes(x));
                                // console.log(`(pairing model): user images - ${user.images}`);
                                // console.log(`(pairing model): opponent images - ${opponent.images}`);
                                // console.log(`(pairing model): common images - ${imageIntersection}`);
                                if (imageIntersection.length < 1) {
                                    // console.log('(pairing model): not enough images');
                                    user.incompatibles.push(opponent.userId);
                                    opponent.incompatibles.push(user.userId);
                                    user.response.status(102);
                                    opponent.response.status(102);
                                } else if(getRandomInt(10) > 4) {
                                    // console.log('(pairing model): enough images');
                                    const image = imageIntersection[getRandomInt(imageIntersection.length)];
                                    respond(user, opponent, image);
                                    pairingPool.delete(user.userId);
                                    pairingPool.delete(opponent.userId);
                                    break;
                                } else {
                                    // console.log('(pairing model): skipped pairing');
                                    break;
                                }
                            }
                            break;
                        } else {
                            console.log(`(pairing model): not enough possible opponents`);
                        }
                    } while (possibleOpponents.length > 0);
                }
                return;
            }
            while(pairableUser.length > 0);
            endOfPairingRun = true;
        }
    },*/
    next (user) {
        pairingPool.set(user.userId, user);
        if  (pairingPool.size > 1) {
            let pairableUser = [...pairingPool.keys()];
            let p = pairableUser[getRandomInt(pairableUser.length)];
            let user = pairingPool.get(p);
            if (user) {
                let possibleOpponents;
                possibleOpponents = pairableUser.filter(x => !user.incompatibles.includes(x));
                if (possibleOpponents.length > 0) {
                    let opponent = pairingPool.get(possibleOpponents[getRandomInt(possibleOpponents.length)]);
                    if  (opponent) {
                        const imageIntersection = user.images.filter(x => opponent.images.includes(x));
                        if (imageIntersection.length < 1) {
                            console.log('notenough');
                            user.incompatibles.push(opponent.userId);
                            opponent.incompatibles.push(user.userId);
                            user.response.status(102);
                            opponent.response.status(102);
                        } else if(getRandomInt(10) > 4) {
                            console.log('match');
                            const image = imageIntersection[getRandomInt(imageIntersection.length)];
                            respond(user, opponent, image);
                            pairingPool.delete(user.userId);
                            pairingPool.delete(opponent.userId);
                        } else {
                            console.log('fail');
                        }
                    }
                }
            }
        }
    },
    error(){

    },
    complete(){

    }
};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function respond(p1, p2, image) {
    let gameId;
    let guesser;
    let recommender;
    let responseGuesser;
    let responseRecommender;
    let guesserResponseBody;
    let recommenderResponseBody;
    if (getRandomInt(2) === 1) {
        guesser = p1;
        recommender = p2;
        responseGuesser = p1.response;
        responseRecommender = p2.response;
        p1.response = '';
        p2.response = '';
    } else {
        guesser = p2;
        recommender = p1;
        responseGuesser = p2.response;
        responseRecommender = p1.response;
        p1.response = '';
        p2.response = '';
    }
    try {
        gameId = await gameController.newGame(guesser, recommender, image);
        let guesserResponseBody = await auth.getToken(guesser.userId, 'guesser', image, gameId, guesser.sessionId, 'none');
        guesser.userToken = guesserResponseBody.idToken;
        responseGuesser.status(200).json(guesserResponseBody);
        let recommenderResponseBody = await auth.getToken(recommender.userId, 'recommender', image, gameId, recommender.sessionId, 'none');
        recommender.userToken = recommenderResponseBody.idToken;
        responseRecommender.status(200).json(recommenderResponseBody);
        gameController.setToken(gameId, guesser, recommender);
    }
    catch (error) {
        console.log(error);
    }
    // gameController.setGame(game.gameId, game);
    console.log('(pairing model): response gameId '+ gameId + ', imageId ' + image);
}

exports.containsUser = (userId) => {
    return new Promise (resolve => {
        let result = Array.from(pairingPool.keys()).includes(userId)
        resolve(result);
    });
};

exports.removeUser = (userId) => {
  pairingPool.delete(userId);
};