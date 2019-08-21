const authModel = require('../models/authenticationModel');
const imageModel = require('../models/imageModel');
const timersocket = require('./timersocket');
const gameController = require('./game');

exports.getImages = async function(request, response){
    let segment;
    let imageId;
    try {
        console.log('(image controller): retrieving image id');
        imageId = await authModel.getImage(request.headers.authorization);
        segment = await imageModel.getImageSegment(request, imageId);
    } catch (err) {
        console.log(err);
    } finally {
        response.set('Content-Type', 'image/png');
        response.send(segment);
    }
};

exports.getPositions = async function(request, response){
    let imageId;
    let segmentMap;
    try {
        console.log('(image controller): retrieving image id');
        imageId = await authModel.getImage(request.headers.authorization);
        segmentMap = await imageModel.getSegmentMap(imageId);
    } catch (err) {
        console.log(err);
    } finally {
        response.status(200).json({segmentMap: segmentMap});
    }
};

exports.getDimension = async function(request, response) {
    let imageId;
    let dimension;
    let role;
    try {
        console.log('(image controller): retrieving image id');
        imageId = await authModel.getImage(request.headers.authorization);
        dimension = await imageModel.getImageDimension(imageId);
        role = await authModel.getRole(request.headers.authorization)
    } catch (err) {
        console.log(err);
    } finally {
        console.log(dimension);
        if(role === 'guesser') {
            dimension.dimensions.label = 'nope, not for you';
            dimension.dimensions.annotation = 'definitely not for you too'
            dimension.dimensions.synonyms = 'still not for you sweetheart'
        }
        response.status(200).json({dimension: dimension});
    }
};

exports.getRefresh = async function(request, response) {
    let gameId;
    let gamewrapper;
    let game;
    try {
        gameId = await authModel.getGame(request.headers.authorization);
        gamewrapper = await gameController.getGame(gameId);
    } catch (error) {
        console.log(error);
    }
    game = gamewrapper.game;
    timersocket.sendRecentGuesses(game);
    timersocket.sendRevealedSegments(game);
    timersocket.sendScore(game);
    response.status(200).json({});
};