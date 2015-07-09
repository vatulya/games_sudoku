function SudokuCellGroup(cells) {
    this.cells = cells; // [Cell]

    if (!this.checkCellsStructure()) {
        throw new Error('Wrong cells structure. Can\'t initialize cell group');
    }
}

SudokuCellGroup.prototype.checkCellsStructure = function () {
    return true;
};

SudokuCellGroup.prototype.isCorrect = function () {
    return true;
};