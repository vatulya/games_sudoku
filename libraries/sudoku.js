function Sudoku (modelSudoku) {
    this.modelSudoku = modelSudoku;
}

Sudoku.prototype.getHash = function () {
    return this.modelSudoku.hash;
};

module.exports = Sudoku;
