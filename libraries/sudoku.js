var extend = require('util')._extend;

var ModelSudoku = require('./../models/sudoku'),
    ModelSudokuBoard = require('./../models/sudoku/board'),
    SudokuBoard = require('./sudoku/board'),
    SudokuHistory = require('./sudoku/history');

function Sudoku(modelSudoku, parameters) {
    this.modelSudoku = modelSudoku;
    this.board = null;
    this.history = null;

    if (typeof parameters === 'object') {
        if (parameters.hasOwnProperty('board') && SudokuBoard.isPrototypeOf(parameters.board)) {
            this.board = parameters.board;
        }
        if (parameters.hasOwnProperty('history') && SudokuHistory.isPrototypeOf(parameters.history)) {
            this.board = parameters.history;
        }
    }
}

/********************************************** PROTECTED METHODS ***/

Sudoku.prototype.getSystemData = function () {
    return {
        _system: {
            gameHash: this.getHash(),
            undoMove: this.history.undo,
            redoMove: this.history.redo,
            duration: 15, // this.duration,
            microtime: new Date().getTime()
        }
    };
};
/********************************************** /PROTECTED METHODS ***/

/********************************************** PUBLIC METHODS ***/

Sudoku.prototype.getHash = function () {
    return this.modelSudoku.hash;
};

Sudoku.prototype.getSize = function () {
    return this.board.size;
};

Sudoku.prototype.getCellByCoords = function (row, col) {
    return this.board.getCellByCoords(row, col);
};

Sudoku.prototype.doUserAction = function (data, callback) {
    var diffCheckedCells = {},
        diffMarkedCells = {};

    if (!this.board.isCorrectParameters(data || {})) {
        return callback(new Error('Wrong user action data'));
    }

    diffCheckedCells = this.history.getDiff(this.board.checkedCells, data.checkedCells || {});
    diffMarkedCells = this.history.getDiff(this.board.markedCells, data.markedCells || {});

    if (Object.keys(diffCheckedCells).length || Object.keys(diffMarkedCells).length) {
        if (this.board.applyCheckedAndMarkedCells(data.checkedCells, data.markedCells)) {
            if (this.history.addAction({checkedCells: diffCheckedCells, markedCells: diffMarkedCells})) {
                this.modelSudoku.setBoard(this.board.toHash());
                this.modelSudoku.save(function (error) {
                    if (error) { return callback(error); }
                    callback(null);
                });
            }
        }
    }

    callback(new Error('Saving data error'));
};

/********************************************** PUBLIC METHODS ***/

/********************************************** STATIC METHODS ***/

Sudoku.create = function (hash, callback) {
    var parameters,
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
};

Sudoku.load = function (hash, callback) {
    ModelSudoku.findOneByHash(hash, function (error, modelSudoku) {
        if (error) { return callback(error); }
        if (!modelSudoku) { return callback(new Error('Wrong hash')); }

        SudokuBoard.load(modelSudoku.boardId, function (error, sudokuBoard) {
            if (error) { return callback(error); }

            SudokuHistory.load(modelSudoku.historyId, function (error, sudokuHistory) {
                if (error) { return callback(error); }
                if (!modelSudoku) { return callback(new Error('Wrong board ID')); }

                callback(null, new Sudoku(modelSudoku, {board: sudokuBoard, history: sudokuHistory}));
            });
        });
    });
};

/********************************************** /STATIC METHODS ***/

module.exports = Sudoku;
