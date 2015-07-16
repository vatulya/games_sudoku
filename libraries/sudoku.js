var ModelSudoku = require('./../models/sudoku');
var SudokuBoard = require('./sudoku/board');

function Sudoku (modelSudoku) {
    this.modelSudoku = modelSudoku;
    this.board = null;
    this.history = null;

    this.init();
}

/********************************************** INIT ***/

Sudoku.prototype.init = function () {
    this.board = new SudokuBoard(this.modelSudoku);
    //this.history = new SudokuHistory(this.modelSudoku);
};

/********************************************** /INIT ***/

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

/********************************************** PUBLIC METHODS ***/

/********************************************** STATIC METHODS ***/

Sudoku.create = function (hash, callback) {
    if (typeof hash != 'string' || !hash) {
        return callback(new Error('Wrong hash'));
    }
    SudokuBoard.generate(hash, function (error, board) {
        if (error) return callback(error);

        // TODO: hide cells in filled board
        // TODO: convert board to parameters and create object Board
        // TODO: create and call method Board.toHash() and save into Model
        // TODO: think about memory leak with two object of Board
        var ModelGame = new ModelSudoku();
        ModelGame.set('hash', hash);
        ModelGame.set('fields', board);
        ModelGame.save(function (error) {
            if (error) return callback(error);
            var Sudoku = new Sudoku(ModelGame); // TODO: check memory leak
            callback(null, Sudoku);
        });
    });
};

Sudoku.load = function (hash, callback) {
    ModelSudoku.findOneByHash(hash, function (error, modelGame) {
        if (error) return callback(error);
        if (!modelGame) return callback(new Error('Wrong hash'));
        var sudoku = new Sudoku(modelGame);
        callback(null, sudoku);
    });
};

/********************************************** /STATIC METHODS ***/

module.exports = Sudoku;
