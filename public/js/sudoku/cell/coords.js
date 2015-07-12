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
    } else if (row.prototype == SudokuCell) {
        this.row = row.container.data('row');
        this.col = row.container.data('col');
    } else {
        var $el = $(row);
        this.row = $el.data('row') || 0;
        this.col = $el.data('col') || 0;
    }

    this.row = parseInt(this.row);
    this.col = parseInt(this.col);

    if (!this.row || !this.col) {
        throw new Error('Can\'t initialize SudokuCellCoords. Wrong parameters.');
    }
}

SudokuCellCoords.prototype.getRow = function () {
    return this.row;
};

SudokuCellCoords.prototype.getCol = function () {
    return this.col;
};

SudokuCellCoords.prototype.toString = function () {
    return '' + this.row + this.separator + this.col;
};

SudokuCellCoords.prototype.toArray = function () {
    return [this.row, this.col];
};

SudokuCellCoords.prototype.getRowCssClass = function () {
    return 'row-' + this.row;
};

SudokuCellCoords.prototype.getColCssClass = function () {
    return 'col-' + this.col;
};
