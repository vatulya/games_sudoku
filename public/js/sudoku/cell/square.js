function SudokuCellSquare() {
    SudokuCellGroup.apply(this, Array.prototype.slice.call(arguments));
}

SudokuCellSquare.prototype = new SudokuCellGroup();