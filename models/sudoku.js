var mongoose = require('./mongoose');
var SudokuBoard = require('../libraries/sudoku/board');

var sudokuSchema = mongoose.Schema({
    hash: String,
    size: Number,
    openedCells: {},
    checkedCells: {},
    markedCells: {},
    squares: {}
});

sudokuSchema.index({
    hash: 1
});

sudokuSchema.static('findOneByHash', function (hash, callback) {
    return this.findOne({hash: hash}, callback);
});

sudokuSchema.methods.setBoard = function (board) {
    var Cell;

    this.set('size', board.size);

    var openedCells = {};
    Object.keys(board.openedCells).forEach(function (key) {
        Cell = board.openedCells[key];
        openedCells[Cell.coords.toString()] = Cell.number;
    });
    this.set('openedCells', openedCells);

    var checkedCells = {};
    Object.keys(board.checkedCells).forEach(function (key) {
        Cell = board.checkedCells[key];
        checkedCells[Cell.coords.toString()] = Cell.number;
    });
    this.set('checkedCells', checkedCells);

    var markedCells = {};
    Object.keys(board.markedCells).forEach(function (key) {
        Cell = board.markedCells[key];
        markedCells[Cell.coords.toString()] = Cell.marks;
    });
    this.set('markedCells', markedCells);

    var squares = {};
    Object.keys(board.cells).forEach(function (key) {
        Cell = board.cells[key];
        squares[Cell.coords.toString()] = Cell.squareNumber;
    });
    this.set('squares', squares);
};

module.exports = mongoose.model('Sudoku', sudokuSchema);
