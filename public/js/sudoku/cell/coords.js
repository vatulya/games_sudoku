/**
 * new SudokuCellCoords(1, 5)
 * new SudokuCellCoords("1_5") // check this.separator
 * new SudokuCellCoords($element)
 * new SudokuCellCoords(SudokuCell)
 *
 * @param row
 * @param col
 * @constructor
 */
function SudokuCellCoords(row, col) {
    this.row = null;
    this.col = null;

    this.separator = '_';

    if (row && col) {
        this.row = row;
        this.col = col;
    } else if (typeof row == 'string') {
        var coords = row.split(this.separator, 2);
        this.row = coords[0];
        this.col = coords[1];
    } else if (SudokuCell.prototype.isPrototypeOf(row)) {
        var classesString = row.container.attr('class');
        this.row = this.getRowFromCssClass(classesString);
        this.col = this.getColFromCssClass(classesString);
    } else {
        var $el = $(row);
        var classesString = $el.attr('class');
        this.row = this.getRowFromCssClass(classesString);
        this.col = this.getColFromCssClass(classesString);
    }

    this.row = parseInt(this.row);
    this.col = parseInt(this.col);

    if (!this.row || !this.col) {
        throw new Error('Can\'t initialize SudokuCellCoords. Wrong parameters.');
    }
}

SudokuCellCoords.prototype.toString = function () {
    return '' + this.row + this.separator + this.col;
};

SudokuCellCoords.prototype.getRowCssClass = function () {
    return 'row-' + this.row;
};

SudokuCellCoords.prototype.getColCssClass = function () {
    return 'col-' + this.col;
};

SudokuCellCoords.prototype.getRowFromCssClass = function (cssClassesString) {
    return /row-([0-9]+)/.exec(cssClassesString)[1];
};

SudokuCellCoords.prototype.getColFromCssClass = function (cssClassesString) {
    return /col-([0-9]+)/.exec(cssClassesString)[1];
};
