var api = require('../libraries/api');
var game = require('../libraries/game');

module.exports = function (socket) {

    var io = socket.server;

    socket.on('game:create', function (data) {
        var params = {
            application: 'sudoku'
        };
        try {
            api.get('/sudoku/games/create', params, function (error, data) {
                if (error) throw error;
                game.create(data.hash, function (error, sudoku) {
                    if (error) throw error;
                    var url = '/game/' + sudoku.getHash();
                    socket.emit('game:created', {url: url});
                });
            });
        } catch (e) {
            console.log(e);
        }
    });

};