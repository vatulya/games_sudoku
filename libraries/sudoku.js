"use strict";

let extend = require('util')._extend;

let ModelSudoku = require('./../models/sudoku'),
    ModelSudokuBoard = require('./../models/sudoku/board'),
    SudokuBoard = require('./sudoku/board'),
    SudokuHistory = require('./sudoku/history');

let Sudoku = class {

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

    /********************************************** STATIC METHODS ***/

    static load (hash, callback) {
        ModelSudoku.findOneByHash(hash, function (error, modelSudoku) {
            if (error) { return callback(error); }
            if (!modelSudoku) { return callback(new Error('Wrong hash')); }

            SudokuBoard.load(modelSudoku.get('boardId'), function (error, sudokuBoard) {
                if (error) { return callback(error); }

                SudokuHistory.load(modelSudoku.historyId, function (error, sudokuHistory) {
                    if (error) { return callback(error); }
                    if (!modelSudoku) { return callback(new Error('Wrong board ID')); }

                    callback(null, new Sudoku(modelSudoku, {board: sudokuBoard, history: sudokuHistory}));
                });
            });
        });
    }

    static create (hash, callback) {
        let parameters,
            sudoku,
            modelSudoku;

        if (typeof hash !== 'string' || !hash) {
            return callback(new Error('Wrong hash'));
        }

        modelSudoku = new ModelSudoku();
        modelSudoku.set('hash', hash);

        sudoku = new Sudoku(modelSudoku);

        // Sync set board and set history
        parameters = {
            size: 9
        };
        SudokuBoard.create(parameters, function (error, sudokuBoard) {
            if (error) { return callback(error); }

            modelSudoku.set('boardId', sudokuBoard.getId());

            SudokuHistory.create(function (error, sudokuHistory) {
                if (error) { return callback(error); }

                modelSudoku.set('historyId', sudokuHistory.getId());

                modelSudoku.save(function (error) {
                    if (error) { return callback(error); }

                    callback(null, sudoku);
                });
            });
        });
    }

    /********************************************** /STATIC METHODS ***/

    /********************************************** PUBLIC METHODS ***/

    getHash () {
        return this.modelSudoku.hash;
    }

    getSize () {
        return this.board.size;
    }

    getCellByCoords (row, col) {
        return this.board.getCellByCoords(row, col);
    }

    doUserAction (data, callback) {
        let self = this,
            toCells = {},
            diff = {};

        if (!this.board.isCorrectParameters(data || {})) {
            return callback(new Error('Wrong user action data'));
        }

        toCells = SudokuBoard.createCellsFromBoardHash(extend(data, {size: this.board.size}));

        diff = this.history.getDiff(this.board.cells, toCells);

        if (!Object.keys(diff.checkedCells).length && !Object.keys(diff.markedCells).length) {
            callback(new Error('Saving data error'));
        }

        this.board.applyDiff(diff, function (error) {
            if (error) { return callback(error); }
            self.history.addAction(diff, function (error) {
                if (error) { return callback(error); }
                callback(null);
            });
        });
    }

    getSystemData () {
        return {
            _system: {
                gameHash: this.getHash(),
                undoMove: this.history.undo,
                redoMove: this.history.redo,
                duration: 15, // this.duration,
                microtime: new Date().getTime(),
                resolved: this.board.isResolved()
            }
        };
    }

    /********************************************** /PUBLIC METHODS ***/

};

module.exports = Sudoku;
