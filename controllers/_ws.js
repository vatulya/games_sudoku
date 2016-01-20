'use strict';

let extend = require('util')._extend,

    api = require('../libraries/api'),
    Sudoku = require('../libraries/sudoku');

module.exports = function (socket) {

    let io = socket.server;

    socket.on('game:create', (data) => {
        console.log('WS: call "game:create"');

        let params = {
            application: 'sudoku'
        };
        api.get('/sudoku/games/create', params, (error, data) => {
            if (error) { return forceRefresh(socket, error); }

            data = {
                hash: data.hash,
                size: 9 // TODO: get this parameter from user side
            };
            Sudoku.create(data.hash, (error, sudoku) => {
                if (error) { return forceRefresh(socket, error); }

                let url = '/game/' + sudoku.getHash();
                socket.emit('game:created', {url: url});
            });
        });
    });

    socket.on('loadBoard', (data) => {
        console.log('WS: call "loadBoard"');

        Sudoku.load(data._game_hash, (error, sudoku) => {
            if (error) { return forceRefresh(socket, error); }

            let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
            socket.emit('loadBoard', response);
        });
    });

    socket.on('setCell', (data) => {
        console.log('WS: call "setCell"');

        Sudoku.load(data._game_hash, (error, sudoku) => {
            if (error) { return forceRefresh(socket, error); }

            sudoku.setCells(data, (error) => {
                if (error) { return forceRefresh(socket, error); }

                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            });
        });
    });

    socket.on('clearBoard', (data) => {
        console.log('WS: call "clearBoard"');

        Sudoku.load(data._game_hash, (error, sudoku) => {
            if (error) { return forceRefresh(socket, error); }
            sudoku.clearBoard(data, (error) => {
                if (error) { return forceRefresh(socket, error); }

                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            }, true);
        });
    });

    socket.on('undoMove', (data) => {
        console.log('WS: call "undoMove"');

        Sudoku.load(data._game_hash, (error, sudoku) => {
            if (error) { return forceRefresh(socket, error); }

            sudoku.undoMove(data, function (error) {
                if (error) { return forceRefresh(socket, error); }

                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            });
        });
    });

    socket.on('redoMove', (data) => {
        console.log('WS: call "redoMove"');

        Sudoku.load(data._game_hash, (error, sudoku) => {
            if (error) { return forceRefresh(socket, error); }

            sudoku.redoMove(data, (error) => {
                if (error) { return forceRefresh(socket, error); }

                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
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