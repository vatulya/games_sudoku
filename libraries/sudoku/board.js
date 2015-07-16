var extend = require('util')._extend;
var math = require('./../../helpers/math');

var GeneratorSimple = require('./board/generator/simple');
var Cell = require('./cell');
var CellRow = require('./cell/row');
var CellCol = require('./cell/col');
var CellSquare = require('./cell/square');
var CellCoords = require('./cell/coords');
var sizeMap = require('./board/sizesMap');

/**
 * {
 *      size: 9,
 *      cells: {
 *          "1_1": {
 *              coords: "1_1",
 *              number: 1,
 *              isOpen: true,
 *              marks: []
 *          }
 *          "1_2": {
 *              coords: "1_2",
 *              number: 5,
 *              isOpen: false,
 *              marks: [1, 4]
 *          }
 *          ...
 *      },
 *      squares: {
 *          "1_1": 1,
 *          "1_2": 2
 *      }
 * }
 *
 * @param parameters
 * @constructor
 */
function Board (parameters) {

    this.size = 0;

    this.openCells = {};
    this.checkedCells = {};
    this.markedCells = {};

    this.cells = {};
    this.rows = [];
    this.cols = [];
    this.squares = [];

    this.init(parameters);
}

/********************************************** INIT ***/

Board.prototype.init = function (parameters) {
    this.size = parameters.size;

    this.initCells(parameters);
};

Board.prototype.initCells = function (parameters) {
    var self = this;

    var cellsPerRow = [];
    var cellsPerCol = [];
    var cellsPerSquare = [];

    var allKeys = Object.keys(parameters.cells);

    if (this.size != allKeys.length) {
        throw new Error('Wrong board size. Board size "' + this.size + '", but cells per line "' + Math.sqrt(allKeys.length) + '"');
    }

    allKeys.forEach(function (key) {
        var parameters = parameters.cells[key];
        parameters.squareNumber = parameters.squares[key];
        parameters.boardSize = self.size;
        var Cell = new Cell(parameters);

        var coords = Cell.coords.toString();
        self.cells[coords] = Cell;

        if (Cell.isOpen) {
            self.openCells[coords] = Cell;
        } else if (Cell.number) {
            self.checkedCells[coords] = Cell;
        }

        if (Cell.getMarks().length) {
            self.markedCells[coords] = Cell;
        }

        var row = Cell.coords.row;
        var col = Cell.coords.col;

        // Fill rows array
        if (!cellsPerRow[row]) {
            cellsPerRow[row] = [];
        }
        cellsPerRow[row][col] = Cell;

        // Fill cols array
        if (!cellsPerCol[col]) {
            cellsPerCol[col] = [];
        }
        cellsPerCol[col][row] = Cell;

        // Fill squares array
        var square = Cell.squareNumber;
        if (!cellsPerSquare[square]) {
            cellsPerSquare[square] = [];
        }
        cellsPerSquare[square].push(Cell);
    });

    // Initialize rows
    this.rows = [];
    $.each(cellsPerRow, function (row, cells) {
        self.rows[row] = new CellRow(cells);
    });

    // Initialize cols
    this.cols = [];
    $.each(cellsPerCol, function (col, cells) {
        self.cols[col] = new CellCol(cells);
    });

    // Initialize squares
    this.squares = [];
    $.each(cellsPerSquare, function (square, cells) {
        self.squares[square] = new CellSquare(cells);
    });
};

/********************************************** /INIT ***/

/********************************************** PUBLIC METHODS ***/

/**
 * @param row
 * @param col
 * @returns Cell
 */
Board.prototype.getCellByCoords = function (row, col) {
    var Coords = new CellCoords(row, col);
    return this.cells[Coords.toString()];
};

/********************************************** /PUBLIC METHODS ***/

/********************************************** STATIC METHODS ***/

Board.generate = function (size, callback) {
    // Here can be logic to choose generator
    GeneratorSimple.generate(size, callback);
};

Board.getAllowedSizes = function () {
    return sizeMap.allowedSizes;
};

/********************************************** /STATIC METHODS ***/

/********************************************** FOR TESTS ***/

Board.validateBoardStructure = function (board) {
    var size = Math.sqrt(Object.keys(board).length);
    if (this.getAllowedSizes().indexOf(size) == -1) {
        return false;
    }
    for (var coords in board) {
        if (board.hasOwnProperty(coords)) {
            coords = new CellCoords(coords);
            if (
                !math.inRange(board[coords.toString()], 0, size) // can be zero when no entered number
                || !math.inRange(coords.row, 1, size)
                || !math.inRange(coords.col, 1, size)
            ) {
                return false;
            }
        }
    }
    return true;
};

/********************************************** /FOR TESTS ***/

module.exports = Board;
