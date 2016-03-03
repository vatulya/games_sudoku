'use strict';

let array = require('./../../../helpers/array'),

    Cell = require('./../cell'),
    CellCoords = require('./../cell/coords'),
    CellRow = require('./../cell/row'),
    CellCol = require('./../cell/col'),
    CellSquare = require('./../cell/square');

class BoardState {

    constructor (parameters) {
        this.size = +parameters.size; // 4, 6, 9, ...

        this.cells = {};
        this.rows = {};
        this.cols = {};
        this.squares = {};

        this.init(parameters);
    }

    init (parameters) {
        let cellsPerRow = {},
            cellsPerCol = {},
            cellsPerSquare = {},
            openedCells = parameters.openedCells || {},
            checkedCells = parameters.checkedCells || {},
            markedCells = parameters.markedCells || {},
            squares = parameters.squares || {},
            row,
            col,
            coords,
            key,
            cellParameters,
            cell;

        this.openedCells = {};
        this.notOpenedCells = {};

        this.cells = {};
        this.rows = {};
        this.cols = {};
        this.squares = {};

        for (row = 1; row <= this.size; row += 1) {
            for (col = 1; col <= this.size; col += 1) {
                coords = new CellCoords(row, col);
                key = coords.toString();

                cellParameters = {
                    coords: coords.toString(),
                    squareNumber: +squares[key] || 1,
                    boardSize: this.size,
                    number: 0,
                    isOpen: false,
                    marks: []
                };

                if (openedCells.hasOwnProperty(key) && parseInt(openedCells[key]) > 0) { // TODO: check it
                    cellParameters.isOpen = true;
                    cellParameters.number = openedCells[key];
                } else {
                    // Cell can't be open and checked. Cell can't be open and marked
                    if (checkedCells.hasOwnProperty(key)) {
                        cellParameters.number = checkedCells[key];
                    }
                    if (markedCells.hasOwnProperty(key)) {
                        cellParameters.marks = markedCells[key].slice();
                    }
                }

                cell = new Cell(cellParameters);

                this.cells[coords] = cell;

                if (cell.isOpen) {
                    this.openedCells[coords] = cell;
                } else {
                    this.notOpenedCells[coords] = cell;
                }

                if (!cellsPerRow[row]) {
                    cellsPerRow[row] = [];
                }
                if (!cellsPerCol[col]) {
                    cellsPerCol[col] = [];
                }
                if (!cellsPerSquare[cell.squareNumber]) {
                    cellsPerSquare[cell.squareNumber] = [];
                }

                cellsPerRow[row][col] = cell;
                cellsPerCol[col][row] = cell;
                cellsPerSquare[cell.squareNumber].push(cell);
            }
        }

        // Initialize rows
        this.rows = {};
        Object.keys(cellsPerRow).forEach((row) => {
            this.rows[row] = new CellRow(cellsPerRow[row]);
        });

        // Initialize cols
        this.cols = {};
        Object.keys(cellsPerCol).forEach((col) => {
            this.cols[col] = new CellCol(cellsPerCol[col]);
        });

        // Initialize squares
        this.squares = {};
        Object.keys(cellsPerSquare).forEach((square) => {
            this.squares[square] = new CellSquare(cellsPerSquare[square]);
        });

        return this;
    }

    /**
     * @param {BoardState|Object} newState
     * @return {Object}
     */
    diff (newState) {
        let diff = {
                checkedCells: {},
                markedCells: {}
            },
            oldCell,
            newCell;

        if (!(newState instanceof BoardState)) {
            newState = new BoardState(newState);
        }

        for (let coords in this.notOpenedCells) {
            if (!this.notOpenedCells.hasOwnProperty(coords)) {
                continue;
            }
            if (!newState.notOpenedCells.hasOwnProperty(coords)) {
                continue; // error!
            }

            oldCell = this.notOpenedCells[coords];
            newCell = newState.cells[coords];

            if (oldCell.number !== newCell.number) {
                diff.checkedCells[coords] = newCell.number;
            }
            if (array.isDifferent(oldCell.marks, newCell.marks)) {
                diff.markedCells[coords] = newCell.marks;
            }
        }

        return diff;
    }

    apply (checkedCells, markedCells) {
        let result = true;

        if (Object.keys(checkedCells).length) {
            result = Object.keys(checkedCells).every((key) => {
                if (!this.cells.hasOwnProperty(key)) {
                    return false;
                }
                return this.cells[key].setNumber(checkedCells[key]);
            });
        }
        if (result && Object.keys(markedCells).length) {
            result = Object.keys(markedCells).every((key) => {
                if (!this.cells.hasOwnProperty(key)) {
                    return false;
                }
                return this.cells[key].setMarks(markedCells[key]);
            });
        }

        return result;
    }

    clear () {
        Object.keys(this.notOpenedCells).forEach((key) => {
            let cell = this.notOpenedCells[key];
            cell.setNumber(0);
            cell.removeAllMarks();
        });

        return this;
    }

    /**
     * @param {String|Number} row
     * @param {String|Number} col
     * @returns Cell
     */
    getCellByCoords (row, col) {
        let Coords = new CellCoords(row, col);
        return this.cells[Coords.toString()];
    }

    /**
     * @param {Cell} cell
     * @param {Number} number
     */
    removeColRowSquareMarks (cell, number) {
        let row = this.rows[cell.coords.row],
            col = this.cols[cell.coords.col],
            square = this.squares[cell.squareNumber];

        Object.keys(row.cells).forEach((key) => {
            if (!row.cells[key].isOpen) {
                row.cells[key].removeMark(number);
            }
        });
        Object.keys(col.cells).forEach((key) => {
            if (!col.cells[key].isOpen) {
                col.cells[key].removeMark(number);
            }
        });
        Object.keys(square.cells).forEach((key) => {
            if (!square.cells[key].isOpen) {
                square.cells[key].removeMark(number);
            }
        });

        return this;
    }

    /**
     * @param {Cell} cell
     * @param {Number} number
     */
    isAllowedNumberPosition(cell, number) {
        let row = this.rows[cell.coords.row],
            col = this.cols[cell.coords.col],
            square = this.squares[cell.squareNumber],

            checkGroup = (group) => {
                return Object.keys(group.cells).every((key) => {
                    if (group.cells[key].coords.toString() !== cell.coords.toString()) {
                        if (group.cells[key].number === number) {
                            return false;
                        }
                    }
                    return true;
                });
            };

        return [row, col, square].every(checkGroup);
    }

    toHash () {
        let cell,
            number,
            hash = {
                size: this.size,
                openedCells: {},
                checkedCells: {},
                markedCells: {},
                squares: {}
            };

        Object.keys(this.cells).forEach((key) => {
            cell = this.cells[key];
            number = cell.number;
            if (cell.isOpen) {
                hash.openedCells[key] = number;
            } else {
                if (cell.number) {
                    hash.checkedCells[key] = number;
                }
                if (cell.marks.length) {
                    hash.markedCells[key] = cell.marks.slice();
                }
            }
            hash.squares[key] = +cell.squareNumber;
        });

        return hash;
    }

    copy () {
        return new BoardState(this.toHash());
    }

}

module.exports = BoardState;