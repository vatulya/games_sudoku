'use strict';

let extend = require('util')._extend,

    api = require('../libraries/api'),
    Sudoku = require('../libraries/sudoku'),
    Bot = require('../libraries/bot');

module.exports = (socket) => {

    let io = socket.server;

    socket.on('game:create', (data) => {
        console.log('WS: call "game:create"');

        let params = {
            application: 'sudoku'
        };

        api.get('/sudoku/games/create', params)
            .then((response) => {
                let data = {
                    hash: response.hash,
                    size: 9 // TODO: get this parameter from user side
                };
                return Sudoku.create(data.hash);
            })
            .then((sudoku) => {
                let response = {
                    url: '/game/' + sudoku.getHash()
                };
                socket.emit('game:created', response);
            })
            .catch((error) => {
                return forceRefresh(socket, error);
            });
    });

    socket.on('loadBoard', (data) => {
        console.log('WS: call "loadBoard"');

        Sudoku.load(data._game_hash)
            .then((sudoku) => {
                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('loadBoard', response);
            })
            .catch((error) => {
                return forceRefresh(socket, error);
            });
    });

    socket.on('setCell', (data) => {
        console.log('WS: call "setCell"');

        Sudoku.load(data._game_hash)
            .then((sudoku) => {
                return sudoku.setCells(data);
            })
            .then((sudoku) => {
                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            })
            .catch((error) => {
                return forceRefresh(socket, error);
            });
    });

    socket.on('clearBoard', (data) => {
        console.log('WS: call "clearBoard"');

        Sudoku.load(data._game_hash)
            .then((sudoku) => {
                return sudoku.clearBoard(data);
            })
            .then((sudoku) => {
                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            })
            .catch((error) => {
                return forceRefresh(socket, error);
            });
    });

    socket.on('undoMove', (data) => {
        console.log('WS: call "undoMove"');

        Sudoku.load(data._game_hash)
            .then((sudoku) => {
                return sudoku.undoMove(data);
            })
            .then((sudoku) => {
                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            })
            .catch((error) => {
                return forceRefresh(socket, error);
            });
    });

    socket.on('redoMove', (data) => {
        console.log('WS: call "redoMove"');

        Sudoku.load(data._game_hash)
            .then((sudoku) => {
                return sudoku.redoMove(data);
            })
            .then((sudoku) =>{
                let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                socket.emit('systemData', response);
            })
            .catch((error) => {
                return forceRefresh(socket, error);
            });
    });

    socket.on('startBot', (data) => {
        console.log('WS: call "startBot"');

        Sudoku.load(data._game_hash)
            .then((sudoku) => {

                Bot.create(sudoku)
                    .on('start', () => {
                        console.log('BOT START');
                    })
                    .on('beforeAction', () => {
                        console.log('BOT: beforeAction');
                    })
                    .on('afterAction', (error) => {
                        console.log('BOT: afterAction');

                        if (error) {
                            return forceRefresh(socket, error);
                        }

                        let response = extend(sudoku.board.toHash(), sudoku.getSystemData());
                        socket.emit('systemData', response);
                    })
                    .on('beforeSetCell', () => {})
                    .on('afterSetCell', () => {})
                    .on('beforeSetMark', () => {})
                    .on('afterSetMark', () => {})
                    .on('beforeUndo', () => {})
                    .on('afterUndo', () => {})
                    .on('stop', () => {
                        console.log('BOT STOP');
                    })
                    .start();

            })
            .catch((error) => {
                return forceRefresh(socket, error);
            });
    });

};

function forceRefresh(socket, error) {
    console.log(error);

    socket.emit('system:forceRefresh', {message: error.message});
    return true;
}