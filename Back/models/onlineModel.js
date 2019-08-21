let loggedInUsers = new Map();

exports.logUser = function(a) {
    return new Promise ( resolve => {
        loggedInUsers.set(a.userId,a);
        resolve(loggedInUsers.size);
    });
};

exports.logUserOut = function(a) {
    return new Promise (resolve => {
        loggedInUsers.delete(a.userId);
        resolve(loggedInUsers.size);
    });    
};

exports.getSize = function() {
    return loggedInUsers.size;
};

exports.isLoggedIn = function (userid) {
    return new Promise ( resolve => {
        resolve(([...loggedInUsers.keys()].includes(userid))? true: false);
    });
};
