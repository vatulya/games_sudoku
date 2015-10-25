var extend = require('util')._extend;
var math = require('./../../helpers/math');

var ModelSudokuBoard = require('./../../models/sudoku/board');
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
 * @param model
 * @constructor
 */
function Board(model) {
    this.model = model;

    this.size = 0; // 4, 6, 9, ...

    this.cells = {};
    this.rows = [];
    this.cols = [];
    this.squares = [];

    this.init(Board.getParametersFromModel(model));
}

/********************************************** INIT ***/

Board.prototype.init = function (parameters) {
    this.size = parameters.size;

    this.initCells(parameters);
};

Board.prototype.initCells = function (parameters) {
    var self = this,
        cellsPerRow = [],
        cellsPerCol = [],
        cellsPerSquare = [],
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

    this.cells = {};
    this.rows = [];
    this.cols = [];
    this.squares = [];

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

            if (openedCells.hasOwnProperty(key) && +openedCells[key] && this.checkNumber(openedCells[key])) {
                cellParameters.isOpen = true;
                cellParameters.number = openedCells[key];
            } else {
                // Cell can't be open and checked. Cell can't be open and marked
                if (checkedCells.hasOwnProperty(key) && +checkedCells[key] && this.checkNumber(checkedCells[key])) {
                    cellParameters.number = checkedCells[key];
                }
                if (markedCells.hasOwnProperty(key)) {
                    cellParameters.marks = markedCells[key];
                }
            }

            cell = new Cell(cellParameters);

            this.cells[coords] = cell;

            if (cell.isOpen) {
                this.openedCells[coords] = cell;
            }

            if (!cellsPerRow[row]) {
                cellsPerRow[row] = [];
            }
            if (!cellsPerCol[col]) {
                cellsPerCol[col] = [];
            }
            if (!cellsPerSquare[Cell.squareNumber]) {
                cellsPerSquare[Cell.squareNumber] = [];
            }

            cellsPerRow[row][col] = cell;
            cellsPerCol[col][row] = cell;
            cellsPerSquare[Cell.squareNumber].push(cell);
        }
    }

    // Initialize rows
    this.rows = [];
    cellsPerRow.forEach(function (row) {
        self.rows[row] = new CellRow(cellsPerRow[row]);
    });

    // Initialize cols
    this.cols = [];
    cellsPerCol.forEach(function (col) {
        self.cols[col] = new CellCol(cellsPerCol[col]);
    });

    // Initialize squares
    this.squares = [];
    cellsPerSquare.forEach(function (square) {
        self.squares[square] = new CellSquare(cellsPerSquare[square]);
    });
};

/********************************************** /INIT ***/

/********************************************** PUBLIC METHODS ***/

Board.prototype.getId = function () {
    return this.model.get('id');
};

/**
 * @param row
 * @param col
 * @returns Cell
 */
Board.prototype.getCellByCoords = function (row, col) {
    var Coords = new CellCoords(row, col);
    return this.cells[Coords.toString()];
};

Board.prototype.toHash = function () {
    var self = this,
        cell,
        number,
        hash = {
            size: this.size,
            openedCells: {},
            checkedCells: {},
            markedCells: {},
            squares: {}
        };

    Object.keys(this.cells).forEach(function (key) {
        cell = self.cells[key];
        number = +cell.number;
        if (cell.isOpen) {
            hash.openedCells[key] = number;
        } else {
            if (cell.number) {
                hash.checkedCells[key] = number;
            }
            if (cell.marks.length) {
                hash.markedCells[key] = cell.marks;
            }
        }
        hash.squares[key] = +cell.squareNumber;
    });

    return hash;
};

Board.prototype.checkNumber = function (number) {
    return !!(0 <= +number && +number <= this.size);
};

Board.prototype.isCorrectParameters = function (parameters) {
    if (this._isCorrectOpenedCells(parameters.openedCells || {})) {
        if (this._isCorrectCheckedCells(parameters.checkedCells || {})) {
            if (this._isCorrectMarkedCells(parameters.markedCells || {})) {
                return true;
            }
        }
    }

    return false;
};

Board.prototype.applyDiff = function (diff, callback) {
    var self = this,
        result = true;

    if (diff.hasOwnProperty('checkedCells')) {
        result = Object.keys(diff.checkedCells).every(function (key) {
            if (!self.cells.hasOwnProperty(key)) {
                return false;
            }
            return self.cells[key].setNumber(diff.checkedCells[key]);
        });
    }
    if (result && diff.hasOwnProperty('markedCells')) {
        result = Object.keys(diff.markedCells).every(function (key) {
            if (!self.cells.hasOwnProperty(key)) {
                return false;
            }
            return self.cells[key].setMarks(diff.checkedCells[key]);
        });
    }

    if (!result) {
        return callback(new Error('Can\'t apply board diff'));
    }

    return this._save(callback);
};

Board.prototype.isResolved = function () {
    return false;
};

/********************************************** /PUBLIC METHODS ***/

/********************************************** PROTECTED METHODS ***/

Board.prototype._isCorrectOpenedCells = function (openedCells) {
    var self = this,
        keys = Object.keys(openedCells),
        isCorrect = function (key) {
            if (self.openedCells.hasOwnProperty(key)) { // board has the same opened cell
                if (+openedCells[key] === +self.openedCells[key].number) { // numbers are the same
                    return true;
                }
            }
            return false;
        };

    if (!keys.length) {
        return true; // Allow when empty. We can skip this test because openedCells is static
    }

    if (keys.length !== Object.keys(this.openedCells).length) {
        return false;
    }

    return keys.every(isCorrect);
};

Board.prototype._isCorrectCheckedCells = function (checkedCells) {
    var self = this,
        keys = Object.keys(checkedCells),
        isCorrect = function (key) {
            if (CellCoords.parse(key)) { // correct coords
                if (!self.openedCells.hasOwnProperty(key)) { // non-opened
                    if (self.checkNumber(checkedCells[key])) { // correct number
                        return true;
                    }
                }
            }
            return false;
        };

    return keys.every(isCorrect);
};

Board.prototype._isCorrectMarkedCells = function (markedCells) {
    var self = this,
        keys = Object.keys(markedCells),
        isCorrect = function (key) {
            if (CellCoords.parse(key)) { // correct coords
                if (!self.openedCells.hasOwnProperty(key)) { // non-opened
                    if (Array.isArray(markedCells[key])) {
                        if (markedCells[key].every(self.checkNumber)) { // each mark is correct number. zero allowed and will be filtered in setMark
                            return true;
                        }
                    }
                }
            }
            return false;
        };

    return keys.every(isCorrect);
};

Board.prototype._save = function (callback) {
    var hash = this.toHash();
    if (!this.isCorrectParameters(hash)) {
        return callback(new Error('Can\'t save board. Wrong board structure.'));
    }
    this.model.set('checkedCells', hash.checkedCells || {});
    this.model.set('markedCells', hash.markedCells || {});
    this.model.save(function (error) {
        if (error) { return callback(error); }
        callback(null);
    });
};

/********************************************** /PROTECTED METHODS ***/

/********************************************** STATIC METHODS ***/

Board.generate = function (parameters, callback) {
    // Here can be logic to choose generator
    GeneratorSimple.generate(parameters.size, callback);
};

Board.getAllowedSizes = function () {
    return sizeMap.allowedSizes;
};

Board.hideCells = function (boardHash, countCellsToHide) {
    var allKeys = Object.keys(boardHash),
        index;
    while (countCellsToHide > 0) {
        index = math.random(0, allKeys.length);
        boardHash[allKeys[index]] = 0;
        allKeys.splice(index, 1);
        countCellsToHide -= 1;
    }
    return boardHash;
};

Board.convertSimpleBoardHashToParameters = function (boardHash, squares) {
    var openedCells = {},
        allKeys = Object.keys(boardHash);

    allKeys.forEach(function (key) {
        openedCells[key] = boardHash[key];
    });

    return {
        size: +Math.sqrt(allKeys.length),
        openedCells: openedCells,
        checkedCells: {},
        markedCells: {},
        squares: squares
    };
};

Board.getParametersFromModel = function (model) {
    return {
        size: +model.get('size'),
        openedCells: model.get('openedCells') || {},
        checkedCells: model.get('checkedCells') || {},
        markedCells: model.get('markedCells') || {},
        squares: model.get('squares') || {}
    };
};

Board.createCellsFromBoardHash = function (parameters) {
    var pseudoBoard = extend({}, Board.prototype);
    Board.prototype.init.call(pseudoBoard, parameters);

    return pseudoBoard.cells;
};

Board.create = function (parameters, callback) {
    Board.generate(parameters, function (error, simpleBoardHash, squares) {
        if (error) { return callback(error); }

        parameters = Board.convertSimpleBoardHashToParameters(simpleBoardHash, squares);
        Board.hideCells(parameters.openedCells, 15);/* parameters.difficulty.getHiddenCellsCount() */

        var model = new ModelSudokuBoard();
        model.set('size', parameters.size);
        model.set('openedCells', parameters.openedCells);
        model.set('checkedCells', parameters.checkedCells);
        model.set('markedCells', parameters.markedCells);
        model.set('squares', parameters.squares);
        model.save(function (error) {
            if (error) { return callback(error); }

            callback(null, new Board(model));
        });
    });
};

Board.load = function (id, callback) {
    ModelSudokuBoard.findById(id, function (error, model) {
        if (error) { return callback(error); }
        if (!model) { return callback(new Error('Wrong board ID')); }

        callback(null, new Board(model));
    });
};

/********************************************** /STATIC METHODS ***/

/********************************************** FOR TESTS ***/

Board.validateBoardStructure = function (board) {
    var size = Math.sqrt(Object.keys(board).length),
        coords;

    if (this.getAllowedSizes().indexOf(size) === -1) {
        return false;
    }
    for (coords in board) {
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
