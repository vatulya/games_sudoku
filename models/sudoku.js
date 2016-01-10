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

sudokuSchema.methods.getBoardModel = function (callback) {
    this.model('sudoku_board').findById(this.get('boardId'), callback);
    //SudokuBoard.findById(this.boardId, callback);
};

sudokuSchema.methods.getHistoryModel = function (callback) {
    this.model('sudoku_history').findById(this.get('historyId'), callback);
    //SudokuHistory.findById(this.historyId, callback);
};


module.exports = mongoose.model('sudoku', sudokuSchema);
