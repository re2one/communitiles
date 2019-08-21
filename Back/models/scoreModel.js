const pool = require('../connection/connection');

exports.getScore = async function() {
    let score;
    let connection;
    try {
        connection = await pool.getConnection();
        score = await connection.query('CALL GetScore();');
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection){
            connection.end();
        }
    }
    console.log(score);
    let result = [];
    score[0].forEach(x => result.push(x));
    console.log(result);
    return result;
};

exports.getUserScore = async function(userId){
    let score;
    let connection;
    try {
        connection = await pool.getConnection();
        score = await connection.query('CALL GetUserScore(?);', [userId]);
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection){
            connection.end();
        }
    }
    console.log(score);
    let result = [];
    score[0].forEach(x => result.push(x));
    console.log(result);
    return result;
};