const pool = require('../connection/connection');

// gets a user object if the given user is authorized, null otherwise
// email: Users email as stored in database
// password: Users password which is stored as a hashed value in database
exports.postNewUser = async function(username, email, password) {
    let user;
    let result;
    let connection;
    try {
        connection = await pool.getConnection();
        let rows = await connection.query('CALL AddUser(?, ?, ?, @UserId);', [email, password, username]);
        result = (rows.affectedRows>0)? true:false;
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection){
            connection.end();
        }
    }

    return result;
};

