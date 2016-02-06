'use strict';

var mongoose = require('./../mongoose');

var boardSchema = mongoose.Schema({
    size: Number,
    openedCells: {},
    checkedCells: {},
    markedCells: {},
    squares: {}
});

module.exports = mongoose.model('sudoku_board', boardSchema);
