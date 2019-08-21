const pool = require('../connection/connection');
const authModel = require('./authenticationModel');

exports.getUser = async function(userId, token){
    let user;
    let connection;
    let imagesToAnnotate;
    let sessionId;
    try {
        connection = await pool.getConnection();
        user = await connection.query('CALL GetUser(?);', [userId]);
        imagesToAnnotate = await connection.query('Call GetAllImages(?);', [1]);
        //imagesToAnnotate = await connection.query('Call GetAllImages();');
        sessionId = await authModel.getSession(token);
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection){
            connection.end();
        }
    }
    let playedImages = (user[0][0].Images)? user[0][0].Images.split(','): [];
    let intersection = imagesToAnnotate[0].map(x => x.ImageId).filter(x => !playedImages.includes(x.toString()));
    return {
        userToken: token.replace('Bearer ', ''),
        username: user[0][0].Username,
        userId: userId,
        images: intersection,
        response: '',
        incompatibles: [],
        ready: false,
        sessionId: sessionId
    };
};