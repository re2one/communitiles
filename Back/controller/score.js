const scoreModel = require('../models/scoreModel');
const authModel = require('../models/authenticationModel');

exports.getScore = async function(request, response) {
    console.log('(score controller): get Score');
    let score;
    try {
        score = await scoreModel.getScore();
    } catch (err){
        console.log(err);
    }
    response.status(200).json(score)
};

exports.getUserScore = async function(request, response) {
    console.log('(score controller): get user score');
    let score;
    let userId; 
    try {
        userId = await authModel.getUserId(request.headers.authorization);
        score = await scoreModel.getUserScore(userId);
    } catch (err) {
        console.log(err);
    }
    response.status(200).json(score);
};
