var api = require('../libraries/api');
var Sudoku = require('../libraries/sudoku');

module.exports = function (socket) {

    var io = socket.server;

    socket.on('game:create', function (data) {
        var params = {
            application: 'sudoku'
        };
        api.get('/sudoku/games/create', params, function (error, data) {
            if (error) return console.log(error);
            Sudoku.create(data.hash, function (error, sudoku) {
                if (error) throw error;
                var url = '/game/' + sudoku.getHash();
                socket.emit('game:created', {url: url});
            });
        });
    });

};