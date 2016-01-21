'use strict';

let separator = '_';

class CellCoords {

    /**
     * new CellCoords(1, 5)
     * new CellCoords("1_5") // check separator
     *
     * If you don't need to create new Object (example: just check valid coords) then you can call CellCoords.parse(row, col)
     *
     * @param {Number|String} row
     * @param {Number=} col
     * @constructor
     */
    constructor (row, col) {
        let coords = CellCoords.parse(row, col);

        if (!coords) {
            throw new Error('Can\'t initialize Sudoku Cell Coords. Wrong parameters.');
        }

        this.row = coords[0];
        this.col = coords[1];
    }

    toString () {
        return '' + this.row + separator + this.col;
    }

    getRowCssClass () {
        return 'row-' + this.row;
    }

    getColCssClass () {
        return 'col-' + this.col;
    }

    getRowFromCssClass (cssClassesString) {
        return /row-([0-9]+)/.exec(cssClassesString)[1];
    }

    getColFromCssClass (cssClassesString) {
        return /col-([0-9]+)/.exec(cssClassesString)[1];
    }

    static parse (row, col) {
        let coords = [];

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
    }

}

module.exports = CellCoords;
