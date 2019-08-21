const pool = require('../connection/connection');

exports.newGame = async (guesser, recommender, image) => {
    let gameId;
    try {
        console.log('(game model): creating new Game');
        gameId = await addGame(guesser, recommender, image);
    }
    catch (error) {
        throw error;
    }
    const result = {
        gameId: gameId,
        recommender: recommender,
        guesser: guesser,
        image: image,
        turn: 150,
        segments: [],
        guesses: [],
        start: new Date(),
        numberOfSegments: null,
        movingPlayer: 'recommender'
    };
    return result;
};

async function addGame(guesser, recommender, image) {
    let connection;
    let gameId;
    try {
        console.log('(game model): adding new Game to database');
        connection = await pool.getConnection();
        const added = await connection.query('CALL AddGame(?, ?, ?, ?, ?, @GameId);', [recommender.userId, guesser.userId, 'recommender', 'guesser', image]);
        gameId = await connection.query('SELECT @GameId AS GameId');
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection){
            connection.end();
        }
    }
    console.log('(game model): returning database id of new game entry');
    return gameId[0].GameId;
}

exports.addScore = async function (gameId, score) {
    let connection;
    try {
        console.log('(game model): adding Score to Game');
        connection = await pool.getConnection();
        await connection.query('CALL AddScore(?, ?);', [gameId, score]);
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection){
            connection.end();
        }
    }
};

exports.addAction = async function (userId, user, inputTime, gameTransaction, gameTransactionValue, gameId) {
    let connection;
    try {
        console.log('(game model): adding Action to Game');
        connection = await pool.getConnection();
        await connection.query('CALL AddAction(?, ?, ?, ?, ?, ?);', [userId, user, inputTime, gameTransaction, gameTransactionValue, gameId]);
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection){
            connection.end();
        }
    }
    return true;
};