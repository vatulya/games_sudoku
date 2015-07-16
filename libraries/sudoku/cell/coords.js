/**
 * new Coords(1, 5)
 * new Coords("1_5") // check this.separator
 *
 * @param row
 * @param col
 * @constructor
 */
function Coords(row, col) {
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
    }

    this.row = parseInt(this.row);
    this.col = parseInt(this.col);

    if (!this.row || !this.col) {
        throw new Error('Can\'t initialize Sudoku Cell Coords. Wrong parameters.');
    }
}

Coords.prototype.toString = function () {
    return '' + this.row + this.separator + this.col;
};

Coords.prototype.getRowCssClass = function () {
    return 'row-' + this.row;
};

Coords.prototype.getColCssClass = function () {
    return 'col-' + this.col;
};

Coords.prototype.getRowFromCssClass = function (cssClassesString) {
    return /row-([0-9]+)/.exec(cssClassesString)[1];
};

Coords.prototype.getColFromCssClass = function (cssClassesString) {
    return /col-([0-9]+)/.exec(cssClassesString)[1];
};
