var extend = require('util')._extend;

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
            data = {
                hash: data.hash,
                size: 9 // TODO: get this parameter from user side
            };
            Sudoku.create(data.hash, function (error, sudoku) {
                if (error) throw error;
                var url = '/game/' + sudoku.getHash();
                socket.emit('game:created', {url: url});
            });
        });
    });

    socket.on('loadBoard', function (data) {
        Sudoku.load(data._game_hash, function (error, sudoku) {
            var response = extend(sudoku.board.toHash(), sudoku.getSystemData());
            socket.emit('loadBoard', response);
        });
    });

    socket.on('setCell', function (data) {
        Sudoku.load(data._game_hash, function (error, sudoku) {
            sudoku.doUserAction(data, function (error) {
                var response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            });
        });
    });

};
