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
    var parameters = {
        size: this.modelSudoku.size,
        openedCells: this.modelSudoku.openedCells,
        checkedCells: this.modelSudoku.checkedCells || {},
        markedCells: this.modelSudoku.markedCells || {},
        squares: this.modelSudoku.squares
    };
    this.board = new SudokuBoard(parameters);
    //this.history = new SudokuHistory(this.modelSudoku);
};

/********************************************** /INIT ***/

/********************************************** PROTECTED METHODS ***/

Sudoku.prototype.getSystemData = function () {
    return {
        _system: {
            gameHash: this.getHash(),
            undoMove: {}, // this.history.undo
            redoMove: {}, // this.history.redo
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
    // TODO: remove open cells from checked and marked in data
    // TODO: set checked and marked
    // 
    this.board.applyUserAction(data);
    var a = 1;
};

/********************************************** PUBLIC METHODS ***/

/********************************************** STATIC METHODS ***/

Sudoku.create = function (hash, callback) {
    if (typeof hash != 'string' || !hash) {
        return callback(new Error('Wrong hash'));
    }

    // TODO: add support another sizes and parameters like custom squares configuration
    var parameters = {
        size: 9
    };
    SudokuBoard.generate(parameters, function (error, simpleBoardHash, squares) {
        if (error) return callback(error);

        simpleBoardHash = SudokuBoard.hideCells(simpleBoardHash, 15/*difficulty*/);

        var parameters = SudokuBoard.convertBoardHashToParameters(simpleBoardHash, squares);
        var board = new SudokuBoard(parameters);

        // TODO: to think about memory leak with two object of Board
        var modelSudoku = new ModelSudoku();
        modelSudoku.set('hash', hash);
        modelSudoku.setBoard(board);
        modelSudoku.save(function (error) {
            if (error) return callback(error);
            var sudoku = new Sudoku(modelSudoku); // TODO: check memory leak
            callback(null, sudoku);
        });
    });
};

Sudoku.load = function (hash, callback) {
    ModelSudoku.findOneByHash(hash, function (error, modelSudoku) {
        if (error) return callback(error);
        if (!modelSudoku) return callback(new Error('Wrong hash'));
        var sudoku = new Sudoku(modelSudoku);
        callback(null, sudoku);
    });
};

/********************************************** /STATIC METHODS ***/

module.exports = Sudoku;
