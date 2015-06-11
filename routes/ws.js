var api = require('../libraries/api');
var game = require('../libraries/game');

module.exports = function (socket) {

    var io = socket.server;

    socket.on('game:create', function (data) {
        var params = {
            application: 'sudoku'
        };
        api.get('/sudoku/games/create', params, function (error, data) {
            if (!error) {
                game.create(data.hash, function (gameModel) {
                    var url = '/game/' + gameModel.hash;
                    socket.emit('game:created', {url: url});
                });
            } else {
                console.log(error);
            }
        });
    });

};