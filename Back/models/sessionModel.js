const pool = require('../connection/connection');

exports.newSession = async (userId) => {
    let sessionId;
    let connection;
    try {
        console.log('(session model): creating new Session');
        connection = await pool.getConnection();
        const added = await connection.query('CALL AddSession(?, @SessionId);', [userId]);
        sessionId = await connection.query('SELECT @SessionId AS SessionId');
    }
    catch (error) {
        throw error;
    } finally {
        if (connection) {
            connection.end();
        }
    }
    return sessionId[0].SessionId;
};

exports.addSessionStart = async (sessionId, timestamp) => {
    let connection;
    try {
        console.log('(session model): setting session start');
        connection = await pool.getConnection();
        await connection.query('CALL AddSessionStart(?, ?);', [sessionId, timestamp]);
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

exports.addSessionEnd = async (sessionId, timestamp) => {
    let connection;
    try {
        console.log('(session model): setting session start');
        connection = await pool.getConnection();
        await connection.query('CALL AddSessionEnd(?, ?);', [sessionId, timestamp]);
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