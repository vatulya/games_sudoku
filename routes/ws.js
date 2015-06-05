module.exports = function (socket) {

    var io = socket.server;
    var say = [];

    socket.on('test:say', function (data) {
        console.log('say');
        console.log(data);
        say.push(data);
        socket.broadcast.emit('test:say', data);
    });

    socket.on('test:show', function (data) {
        console.log('show');
        console.log(data);
        socket.emit('test:show', say);
        say = [];
    });

    socket.on('test:bc', function (data) {
        console.log('bc');
        console.log(data);
        io.sockets.emit('test:bc', data);
    });

};