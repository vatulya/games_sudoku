var extend = require('util')._extend;

var api = require('../libraries/api');
var Sudoku = require('../libraries/sudoku');

module.exports = function (socket) {

    var io = socket.server;

    socket.on('game:create', function (data) {
        console.log('WS: call "game:create"');

        var params = {
            application: 'sudoku'
        };
        api.get('/sudoku/games/create', params, function (error, data) {
            if (error) { return forceRefresh(socket, error); }
            data = {
                hash: data.hash,
                size: 9 // TODO: get this parameter from user side
            };
            Sudoku.create(data.hash, function (error, sudoku) {
                if (error) return forceRefresh(socket, error);
                var url = '/game/' + sudoku.getHash();
                socket.emit('game:created', {url: url});
            });
        });
    });

    socket.on('loadBoard', function (data) {
        console.log('WS: call "loadBoard"');

        Sudoku.load(data._game_hash, function (error, sudoku) {
            if (error) return forceRefresh(socket, error);
            var response = extend(sudoku.board.toHash(), sudoku.getSystemData());
            socket.emit('loadBoard', response);
        });
    });

    socket.on('setCell', function (data) {
        console.log('WS: call "setCell"');

        Sudoku.load(data._game_hash, function (error, sudoku) {
            if (error) return forceRefresh(socket, error);
            sudoku.setCells(data, function (error) {
                if (error) return forceRefresh(socket, error);
                var response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            });
        });
    });

    socket.on('clearBoard', function (data) {
        console.log('WS: call "clearBoard"');

        Sudoku.load(data._game_hash, function (error, sudoku) {
            if (error) return forceRefresh(socket, error);
            sudoku.setCells(data, function (error) {
                if (error) return forceRefresh(socket, error);
                var response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            }, true);
        });
    });

    socket.on('useHistory', function (data) {
        console.log('WS: call "undoMove"');

        Sudoku.load(data._game_hash, function (error, sudoku) {
            if (error) return forceRefresh(socket, error);
            sudoku.useHistory(data.historyType || '', data, function (error) {
                if (error) return forceRefresh(socket, error);
                var response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            });
        });
    });

};

function forceRefresh(socket, error) {
    console.log(error);

    socket.emit('system:forceRefresh', {message: error.message});
    return true;
}