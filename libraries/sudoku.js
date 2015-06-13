var ModelSudoku = require('./../models/sudoku');

function Sudoku (modelSudoku) {
    this.modelSudoku = modelSudoku;
}

Sudoku.prototype.getHash = function () {
    return this.modelSudoku.hash;
};

Sudoku.create = function (hash, callback) {
    var modelGame = new ModelSudoku();
    modelGame.set('hash', hash);
    modelGame.save(function (error) {
        if (error) return callback(error);
        var sudoku = new Sudoku(modelGame);
        callback(null, sudoku);
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

module.exports = Sudoku;
