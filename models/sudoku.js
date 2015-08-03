var mongoose = require('./mongoose');
var SudokuBoard = require('./sudoku/board');
var SudokuHistory = require('./sudoku/history');

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

sudokuSchema.methods.getBoardModel = function (callback) {
    this.model('sudoku_board').findById(this.boardId, callback);
    //SudokuBoard.findById(this.boardId, callback);
};

sudokuSchema.methods.getHistoryModel = function (callback) {
    this.model('sudoku_history').findById(this.historyId, callback);
    //SudokuHistory.findById(this.historyId, callback);
};


module.exports = mongoose.model('sudoku', sudokuSchema);
