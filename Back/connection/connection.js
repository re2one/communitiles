const mariadb = require('mariadb');
let config = require('../config/config');

// YOU MIGHT WANT TO ADD YOUR ENVIRONMENT CHECK BELOW
if (process.env.NODE_ENV === 'YOUR_ENVIRONMENT') {
    config = require('../config/your_config');
}

const pool = mariadb.createPool(config);

// asynchronous connection check
pool.getConnection()
    .then(conn => {
        console.log("connected ! connection id is " + conn.threadId);
        conn.end(); //release to pool
    })
    .catch(err => {
        //TODO: handle error
        console.log("not connected due to error: " + err);
    });

module.exports = pool;