function SudokuCellRow() {
    SudokuCellGroup.apply(this, Array.prototype.slice.call(arguments));
}

SudokuCellRow.prototype = new SudokuCellGroup();
SudokuCellRow.prototype.checkCellsStructure = function () {
    // TODO: check cells
    return true;
};