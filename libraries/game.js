var ModelSudoku = require('./model/sudoku');
var Sudoku = require('./sudoku');

module.exports.create = function (hash, callback) {
    var modelGame = new ModelSudoku();
    modelGame.set('hash', hash);
    modelGame.save(function (error) {
        if (error) return error;
        var sudoku = new Sudoku(modelGame);
        callback(null, sudoku);
    });
};

module.exports.load = function (hash, callback) {
    ModelSudoku.findOneByHash(hash, function (error, modelGame) {
        if (error) return error;
        var sudoku = new Sudoku(modelGame);
        callback(null, sudoku);
    });
};
