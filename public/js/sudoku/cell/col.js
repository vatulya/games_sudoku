function SudokuCellCol() {
    SudokuCellGroup.apply(this, Array.prototype.slice.call(arguments));
}

SudokuCellCol.prototype = new SudokuCellGroup();
SudokuCellCol.prototype.checkCellsStructure = function () {
    // TODO: check cells
    return true;
};