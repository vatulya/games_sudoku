'use strict';

let Promise = require('promise'),

    ModelSudoku = require('./../models/sudoku'),
    SudokuBoard = require('./sudoku/board'),
    SudokuBoardGeneratorSimple = require('./sudoku/board/generator/simple'),
    SudokuHistory = require('./sudoku/history'),
    SudokuHistoryAction = require('./sudoku/history/action'),

    SudokuGames = {}; // cache

class Sudoku {

    /********************************************** STATIC METHODS ***/

    static load (hash, refresh) {
        return new Promise((fulfill, reject) => {
            if (refresh && SudokuGames[hash]) {
                console.log('Remove game "' + hash + '" from cache. Cache contains "' + Object.keys(SudokuGames).length + '" games');
                delete SudokuGames[hash];
            }

            if (SudokuGames[hash]) {
                console.log('Game loaded from cache. Cache contains "' + Object.keys(SudokuGames).length + '" games');
                return fulfill(SudokuGames[hash]);
            }

            ModelSudoku.findOneByHash(hash, (error, modelSudoku) => {
                if (error) {
                    return reject(error);
                }
                if (!modelSudoku) {
                    return reject(new Error('Wrong hash'));
                }

                Promise.all([
                        SudokuBoard.load(modelSudoku.get('boardId')),
                        SudokuHistory.load(hash)
                    ])
                    .then((results) => {
                        let sudokuBoard = results[0],
                            sudokuHistory = results[1];

                        SudokuGames[hash] = new Sudoku(modelSudoku, {board: sudokuBoard, history: sudokuHistory});
                        return fulfill(SudokuGames[hash]);
                    })
                    .catch((error) => {
                        return reject(error);
                    });
            });
        });
    }

    static create (hash) {
        return new Promise((fulfill, reject) => {
            let sudoku,
                modelSudoku,
                generator;

            if (typeof hash !== 'string' || !hash) {
                return reject(new Error('Wrong hash'));
            }

            modelSudoku = new ModelSudoku();
            modelSudoku.set('hash', hash);

            sudoku = new Sudoku(modelSudoku);

            generator = new SudokuBoardGeneratorSimple();
            generator.generate(9)
                .then((parameters) => {
                    return SudokuBoard.create(parameters);
                })
                .then((sudokuBoard) => {
                    modelSudoku.set('boardId', sudokuBoard.getId());
                    return SudokuHistory.create(hash);
                })
                .then((sudokuHistory) => {
                    modelSudoku.save((error) => {
                        if (error) {
                            return reject(error);
                        }

                        return fulfill(sudoku);
                    });
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    /********************************************** /STATIC METHODS ***/

    constructor (modelSudoku, parameters) {
        this.modelSudoku = modelSudoku;
        this.board = null;
        this.history = null;

        if (typeof parameters === 'object') {
            if (parameters.hasOwnProperty('board') && parameters.board instanceof SudokuBoard) {
                this.board = parameters.board;
            }
            if (parameters.hasOwnProperty('history') && parameters.history instanceof SudokuHistory) {
                this.history = parameters.history;
            }
        }
    }

    /********************************************** PUBLIC METHODS ***/

    getHash () {
        return this.modelSudoku.hash;
    }

    getSize () {
        return this.board.getSize();
    }

    getCellByCoords (row, col) {
        return this.board.getCellByCoords(row, col);
    }

    getUndo () {
        let action = this.history.getUndo(),
            changes = {};

        if (action instanceof SudokuHistoryAction) {
            changes = this.board.diff(action.parameters.oldParameters || {});
        }

        return changes;
    }

    getRedo () {
        let action = this.history.getRedo(),
            changes = {};

        if (action instanceof SudokuHistoryAction) {
            changes = this.board.diff(action.parameters.oldParameters || {});
        }

        return changes;
    }

    setCells (data) {
        return new Promise((fulfill, reject) => {
            let changes = {
                checkedCells: data.checkedCells,
                markedCells: data.markedCells
            };

            if (!Object.keys(changes.checkedCells).length && !Object.keys(changes.markedCells).length) {
                return reject(new Error('Saving data error'));
            }

            return this.board.apply(changes)
                .then((oldParameters, newParameters) => {
                    let action = new SudokuHistoryAction(SudokuHistoryAction.ACTION_TYPE_SET_CELLS, {
                        oldParameters: oldParameters,
                        newParameters: newParameters
                    });

                    return this.history.addAction(action);
                })
                .then(() => {
                    return fulfill(this);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    clearBoard (data) {
        return new Promise((fulfill, reject) => {
            return this.board.clear()
                .then((oldParameters, newParameters) => {
                    let action = new SudokuHistoryAction(SudokuHistoryAction.ACTION_TYPE_CLEAR_BOARD, {
                        oldParameters: oldParameters,
                        newParameters: newParameters
                    });

                    return this.history.addAction(action);
                })
                .then(() => {
                    return fulfill(this);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    undoMove (data) {
        return new Promise((fulfill, reject) => {
            return this._useHistory('undo')
                .then(() => {
                    return fulfill(this);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }


    redoMove (data) {
        return new Promise((fulfill, reject) => {
            return this._useHistory('redo')
                .then(() => {
                    return fulfill(this);
                }).catch((error) => {
                    return reject(error);
                });
        });
    }

    _useHistory (type) {
        return new Promise((fulfill, reject) => {
            let method,
                actionType,
                changes;

            switch (type) {
                case 'undo':
                    method = 'getUndo';
                    actionType = SudokuHistoryAction.ACTION_TYPE_UNDO;
                    break;

                case 'redo':
                    method = 'getRedo';
                    actionType = SudokuHistoryAction.ACTION_TYPE_REDO;
                    break;

                default:
                    return reject(new Error('Can\'t use Sudoku history. Wrong type "' + type + '"'));
                //break;
            }

            changes = this[method]();

            if (!Object.keys(changes.checkedCells).length && !Object.keys(changes.markedCells).length) {
                return reject(new Error('Nothing to ' + type));
            }

            return this.board.apply(changes)
                .then((oldParameters, newParameters) => {
                    let action = new SudokuHistoryAction(actionType, {
                        oldParameters: oldParameters,
                        newParameters: newParameters
                    });

                    return this.history.addAction(action)
                        .then(fulfill)
                        .catch(reject);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    getSystemData () {
        return {
            _system: {
                gameHash: this.getHash(),
                undoMove: this.getUndo(),
                redoMove: this.getRedo(),
                duration: 15, // this.duration,
                microtime: new Date().getTime(),
                resolved: this.board.isResolved()
            }
        };
    }

    /********************************************** /PUBLIC METHODS ***/

}

module.exports = Sudoku;
