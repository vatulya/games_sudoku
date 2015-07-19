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
 *      openedCells: {
 *          "1_1": 1,
 *          "1_2": 3
 *      },
 *      checkedCells: {
 *          "2_1": 1,
 *          "2_2": 5,
 *      },
 *      markedCells: {
 *          "3_1": [1],
 *          "3_2": [5, 6]
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

    this.openedCells = {};
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
    var cellsPerRow = [];
    var cellsPerCol = [];
    var cellsPerSquare = [];

    this.openedCells = {};
    this.checkedCells = {};
    this.markedCells = {};

    this.cells = {};
    this.rows = [];
    this.cols = [];
    this.squares = [];

    var squareSize = Math.sqrt(this.size);
    for (var row = 1; row <= squareSize; row++) {
        for (var col = 1; col <= squareSize; col++) {
            var coords = new CellCoords(row, col);
            var key = coords.toString();

            var cellParameters = {
                coords: coords,
                squareNumber: parameters.squares[key],
                boardSize: this.size,
                number: 0,
                isOpen: true,
                marks: []
            };

            if (parameters.openedCells.hasOwnProperty(key)) {
                cellParameters.isOpen = true;
                cellParameters.number = parameters.openedCells[key];
            } else {
                if (parameters.checkedCells.hasOwnProperty(key)) {
                    cellParameters.number = parameters.checkedCells[key];
                }
                if (parameters.markedCells.hasOwnProperty(key)) {
                    cellParameters.marks = parameters.markedCells[key];
                }
            }

            var Cell = new Cell(parameters);

            if (Cell.isOpen) {
                this.openedCells[coords] = Cell;
            } else {
                if (Cell.number) {
                    this.checkedCells[coords] = Cell;
                }
                if (Cell.marks.length) {
                    this.markedCells[coords] = Cell;
                }
            }

            this.cells[coords] = Cell;

            if (!cellsPerRow[row]) {
                cellsPerRow[row] = [];
            }
            if (!cellsPerCol[col]) {
                cellsPerCol[col] = [];
            }
            if (!cellsPerSquare[Cell.squareNumber]) {
                cellsPerSquare[Cell.squareNumber] = [];
            }

            cellsPerRow[row][col] = Cell;
            cellsPerCol[col][row] = Cell;
            cellsPerSquare[Cell.squareNumber].push(Cell);
        }
    }

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

Board.generate = function (parameters, callback) {
    // Here can be logic to choose generator
    GeneratorSimple.generate(parameters.size, callback);
};

Board.getAllowedSizes = function () {
    return sizeMap.allowedSizes;
};

Board.hideCells = function (boardHash, countCellsToHide) {
    // TODO: hide cells in filled board
    return boardHash;
};

Board.convertBoardHashToParameters = function (boardHash, squares) {
    var openedCells = {};

    var allKeys = Object.keys(boardHash);
    allKeys.forEach(function (key) {
        openedCells[key] = boardHash[key];
    });

    return {
        size: allKeys.length,
        openedCells: openedCells,
        checkedCells: {},
        markedCells: {},
        squares: squares
    };
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
