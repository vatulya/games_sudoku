'use strict';

var mongoose = require('./mongoose');
var SudokuBoard = require('./sudoku/board');
var SudokuHistory = require('./sudoku/history/action');

var sudokuSchema = mongoose.Schema({
    hash: String,
    boardId: mongoose.Schema.Types.ObjectId,
    historyId: mongoose.Schema.Types.ObjectId
});

sudokuSchema.index({
    hash: 1
});

sudokuSchema.static('findOneByHash', function (hash, callback) {
    return this.findOne({hash: hash}, callback);
});

module.exports = mongoose.model('sudoku', sudokuSchema);
