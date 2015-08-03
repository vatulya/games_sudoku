var separator = '_';

/**
 * new Coords(1, 5)
 * new Coords("1_5") // check this.separator
 *
 * If you don't need to create new Object (example: just check valid coords) then you can call Coords.parse(row, col)
 *
 * @param {Number|String} row
 * @param {Number=} col
 * @constructor
 */
function Coords(row, col) {
    var coords = Coords.parse(row, col);

    if (!coords) {
        throw new Error('Can\'t initialize Sudoku Cell Coords. Wrong parameters.');
    }

    this.row = coords[0];
    this.col = coords[1];
}

Coords.prototype.toString = function () {
    return '' + this.row + separator + this.col;
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

Coords.parse = function (row, col) {
    var coords = [];

    if (+row > 0 && +col > 0) {
        coords = [row, col];
    } else if (typeof row === 'string') {
        coords = row.split(separator, 2);
    }

    coords[0] = +coords[0];
    coords[1] = +coords[1];

    if (coords[0] > 0 && coords[1] > 0) {
        return coords;
    }

    return false;
};

module.exports = Coords;
