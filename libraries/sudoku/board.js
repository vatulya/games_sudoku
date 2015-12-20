"use strict";

let extend = require('util')._extend,
    math = require('./../../helpers/math');

let ModelSudokuBoard = require('./../../models/sudoku/board'),
    BoardStorageHash = require('./board/storage/hash'),
    BoardStorageMongoose = require('./board/storage/mongoose'),
    BoardGeneratorSimple = require('./board/generator/simple'),
    Cell = require('./cell'),
    CellRow = require('./cell/row'),
    CellCol = require('./cell/col'),
    CellSquare = require('./cell/square'),
    CellCoords = require('./cell/coords'),
    sizeMap = require('./board/sizesMap');

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
 * @param BoardStorageNull storage
 * @constructor
 */
let Board = class {

    /********************************************** STATIC METHODS ***/

    static generate (parameters, callback) {
        // Here can be logic to choose generator
        BoardGeneratorSimple.generate(parameters.size, callback);
    }

    static getAllowedSizes () {
        return sizeMap.allowedSizes;
    }

    static hideCells (boardHash, countCellsToHide) {
        let allKeys = Object.keys(boardHash),
            index;

        while (countCellsToHide > 0) {
            index = math.random(0, allKeys.length);
            boardHash[allKeys[index]] = 0;
            allKeys.splice(index, 1);
            countCellsToHide -= 1;
        }

        return boardHash;
    }

    static convertSimpleBoardHashToParameters (boardHash, squares) {
        let openedCells = {},
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
    }

    static getParametersFromStorage (storage) {
        return {
            size: +storage.getParameter('size'),
            openedCells: storage.getParameter('openedCells') || {},
            checkedCells: storage.getParameter('checkedCells') || {},
            markedCells: storage.getParameter('markedCells') || {},
            squares: storage.getParameter('squares') || {}
        };
    }

    static createCellsFromBoardHash (parameters) {
        let board = new Board(new BoardStorageHash(parameters));

        return board.cells;
    }

    static create (parameters, callback) {
        Board.generate(parameters, function (error, simpleBoardHash, squares) {
            if (error) { return callback(error); }

            parameters = Board.convertSimpleBoardHashToParameters(simpleBoardHash, squares);
            Board.hideCells(parameters.openedCells, 15);/* parameters.difficulty.getHiddenCellsCount() */

            parameters = { // prepare parameters to save
                size: parameters.size,
                openedCells: parameters.openedCells,
                checkedCells: parameters.checkedCells,
                markedCells: parameters.markedCells,
                squares: parameters.squares
            };

            let storage = new BoardStorageMongoose(new ModelSudokuBoard());
            storage.save(parameters, function (error) {
                if (error) { return callback(error); }

                callback(null, new Board(storage));
            });
        });
    }

    static load (id, callback) {
        ModelSudokuBoard.findById(id, function (error, model) {
            if (error) { return callback(error); }
            if (!model) { return callback(new Error('Wrong board ID')); }

            let board = new Board(new BoardStorageMongoose(model));
            callback(null, board);
        });
    }

    /********************************************** /STATIC METHODS ***/

    constructor (storage) {
        this.storage = storage;

        this.size = 0; // 4, 6, 9, ...

        this.cells = {};
        this.rows = [];
        this.cols = [];
        this.squares = [];

        this.init(Board.getParametersFromStorage(storage));
    }

    /********************************************** INIT ***/

    init (parameters) {
        this.size = parameters.size;

        this.initCells(parameters);
    }

    initCells (parameters) {
        let self = this,
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
    }

    /********************************************** /INIT ***/

    /********************************************** PUBLIC METHODS ***/

    getId () {
        return this.storage.getId();
    }

    /**
     * @param row
     * @param col
     * @returns Cell
     */
    getCellByCoords (row, col) {
        let Coords = new CellCoords(row, col);
        return this.cells[Coords.toString()];
    }

    toHash () {
        let self = this,
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
    }

    checkNumber (number) {
        return !!(0 <= +number && +number <= this.size);
    }

    isCorrectParameters (parameters) {
        if (this._isCorrectOpenedCells(parameters.openedCells || {})) {
            if (this._isCorrectCheckedCells(parameters.checkedCells || {})) {
                if (this._isCorrectMarkedCells(parameters.markedCells || {})) {
                    return true;
                }
            }
        }

        return false;
    }

    applyDiff (diff, callback) {
        let self = this,
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
    }

    isResolved () {
        return false;
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** PROTECTED METHODS ***/

    _isCorrectOpenedCells (openedCells) {
        let self = this,
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
    }

    _isCorrectCheckedCells (checkedCells) {
        let self = this,
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
    }

    _isCorrectMarkedCells (markedCells) {
        let self = this,
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
    }

    _save (callback) {
        let hash = this.toHash(),
            parameters = {};

        if (!this.isCorrectParameters(hash)) {
            return callback(new Error('Can\'t save board. Wrong board structure.'));
        }

        parameters.checkedCells = hash.checkedCells;
        parameters.markedCells = hash.markedCells;
        this.storage.save(parameters, function (error) {
            if (error) { return callback(error); }
            callback(null);
        });
    }

    /********************************************** /PROTECTED METHODS ***/

    /********************************************** FOR TESTS ***/

    static validateBoardStructure (board) {
        let size = Math.sqrt(Object.keys(board).length),
            coords;

        if (Board.getAllowedSizes().indexOf(size) === -1) {
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

};

module.exports = Board;
