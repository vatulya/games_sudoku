var mongoose = require('./mongoose');
var SudokuBoard = require('../libraries/sudoku/board');

var sudokuSchema = mongoose.Schema({
    hash: String,
    fields: {}
});

sudokuSchema.index({
    hash: 1
});

sudokuSchema.static('findOneByHash', function (hash, callback) {
    return this.findOne({hash: hash}, callback);
});

sudokuSchema.methods.setBoard = function (board) {
    var Cell;

    var openedCells = {};
    Object.keys(board.openedCells).forEach(function (key) {
        Cell = board.openedCells[key];
        openedCells[Cell.coords.toString()] = Cell.number;
    });
    this.set('openedCells', openedCells);

    var checkedCells = {};
    Object.keys(board.checkedCells).forEach(function (key) {
        Cell = board.openedCells[key];
        openedCells[Cell.coords.toString()] = Cell.number;
    });
    this.set('checkedCells', checkedCells);

    var markedCells = {};
    Object.keys(board.checkedCells).forEach(function (key) {
        Cell = board.openedCells[key];
        openedCells[Cell.coords.toString()] = Cell.marks;
    });
    this.set('markedCells', markedCells);
};

module.exports = mongoose.model('Sudoku', sudokuSchema);
