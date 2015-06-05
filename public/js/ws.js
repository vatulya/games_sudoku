$(document).ready(function () {

    var socket = io(Core.ws.server);

    var $buttonSay = $('#test-say');
    var $buttonShow = $('#test-show');
    var $buttonBc = $('#test-bc');

    var $resultContainer = $('#result');
    var show = function (data) {
        $resultContainer.append(JSON.stringify(data) + '<br>');
    };

    $buttonSay.on('click', function () {
        socket.emit('test:say', {message: 'test', obj: {k: 'v'}});
        show('.say');
    });

    $buttonShow.on('click', function () {
        socket.emit('test:show', {message: 'test', obj: {k: 'v'}});
        show('.show');
    });

    $buttonBc.on('click', function () {
        socket.emit('test:bc', {message: 'test', obj: {k: 'v'}});
        show('.bc');
    });

    socket.on('add', function (data) {
        show('new user connected');
    });
    socket.on('del', function (data) {
        show('user disconnected');
    });

    socket.on('test:say', function (data) {
        show(data);
    });

    socket.on('test:show', function (data) {
        show(data);
    });

    socket.on('test:bc', function (data) {
        show(data);
    });

});