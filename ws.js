var router = require('./controllers/ws');

var io;

var onConnect = function (socket) {
    // here logic for new users
};

var onDisconnect = function () {
    // here logic for disconnected users
};

module.exports = function (server) {

    if (io) {
        return io;
    }

    io = require('socket.io')(server);

    io.on('connection', function (socket) {
        onConnect(socket);
        socket.on('disconnect', onDisconnect);

        router(socket);
    });

    return io;

};