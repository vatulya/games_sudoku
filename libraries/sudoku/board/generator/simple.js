'use strict';

let extend = require('util')._extend,
    math = require('./../../../../helpers/math'),

    sizeMap = require('./../../board/sizesMap'),
    Coords = require('./../../cell/coords');

class BoardGeneratorSimple {

    constructor () {
        this.iterationsAmount = 20;
    }

    generate (size) {
        return new Promise((fulfill, reject) => {

            if (sizeMap.allowedSizes.indexOf(size) === -1) {
                return reject(new Error('Board size "' + size + '" is not allowed'));
            }

            return this.generateSimpleBoard(size)
                .then((result) => {
                    let board = result.board,
                        squares = result.squares,
                        parameters;

                    board = this.shuffleBoard(board);
                    board = this.mergeBoardRows(board);
                    parameters = this.convertSimpleBoardHashToParameters(board, squares);
                    parameters.openedCells = this.hideCells(parameters.openedCells, 15);/* parameters.difficulty.getHiddenCellsCount() */

                    return fulfill(parameters);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    generateSimpleBoard (size) {
        return new Promise((fulfill, reject) => {
            let board = [],
                rowArray,
                squares = {},
                coords;

            if (sizeMap.allowedSizes.indexOf(size) === -1) {
                return reject(new Error('Board size "' + size + '" is not allowed'));
            }

            rowArray = Array.apply(null, new Array(size)).map((_, i) => { return i + 1; });
            for (let i = 0; i < size; i++) {
                board.push(this.doOffset(rowArray, this.countOffset(i, size)));
            }

            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    coords = new Coords(row + 1, col + 1);
                    squares[coords.toString()] = sizeMap.map[size].map[row][col];
                }
            }

            return fulfill({board: board, squares: squares});
        });
    }

    shuffleBoard (board) {
        let possibleMethods = [
                'Transposing',
                'SwapRows',
                'SwapCols',
                'SwapSquareRows',
                'SwapSquareCols'
            ],
            methodsCount = possibleMethods.length,
            method = '',
            previousMethod = null;

        board = extend([], board);

        for (let i = 0, j = 5; i < this.iterationsAmount; i++, j = 5) {
            do {
                method = possibleMethods[math.random(1, methodsCount) - 1];
            } while (method === previousMethod && j-- > 0);
            board = this['shuffleBoardBy' + method](board);
            previousMethod = method;
        }

        return board;
    }

    shuffleBoardByTransposing (board) {
        return this.transpose(board);
    }

    shuffleBoardBySwapRows (board) {
        let size = board.length,
            verticalSquares = this.countVerticalSquares(size),
            squareHeight = parseInt(size / verticalSquares),
            squareRowNumber = math.random(0, verticalSquares - 1),
            rowNumber = math.random(0, squareHeight - 1),
            switchRowNumber = parseInt((rowNumber + math.random(1, squareHeight - 1)) % squareHeight),
            fromRowNumber = parseInt(squareRowNumber * squareHeight + rowNumber),
            toRowNumber = parseInt(squareRowNumber * squareHeight + switchRowNumber),
            newBoard = extend([], board);

        newBoard[toRowNumber] = board[fromRowNumber];
        newBoard[fromRowNumber] = board[toRowNumber];

        return newBoard;
    }

    shuffleBoardBySwapCols (board) {
        let newBoard;

        newBoard = this.shuffleBoardByTransposing(board);
        newBoard = this.shuffleBoardBySwapRows(newBoard);
        newBoard = this.shuffleBoardByTransposing(newBoard);

        return newBoard;
    }

    shuffleBoardBySwapSquareRows (board) {
        let size = board.length,
            verticalSquares = this.countVerticalSquares(size),
            squareHeight = parseInt(size / verticalSquares),
            squareNumber = math.random(0, verticalSquares - 1),
            switchSquareNumber = parseInt((squareNumber + math.random(1, verticalSquares - 1)) % verticalSquares),
            fromRow = parseInt(squareNumber * squareHeight),
            toRow = parseInt(switchSquareNumber * squareHeight),
            newBoard = extend([], board);

        for (let i = 0; i < squareHeight; i++) {
            newBoard[toRow + i] = board[fromRow + i];
            newBoard[fromRow + i] = board[toRow + i];
        }

        return newBoard;
    }

    shuffleBoardBySwapSquareCols (board) {
        let newBoard;

        newBoard = this.shuffleBoardByTransposing(board);
        newBoard = this.shuffleBoardBySwapSquareRows(newBoard);
        newBoard = this.shuffleBoardByTransposing(newBoard);

        return newBoard;
    }

    mergeBoardRows (board) {
        let mergedBoards = {},
            coords;

        board = extend([], board);

        board.forEach((row, rowNumber) => {
            row.forEach((value, colNumber) => {
                coords = new Coords(rowNumber + 1, colNumber + 1); // without zeros
                mergedBoards[coords.toString()] = value;
            });
        });

        return mergedBoards;
    }

    hideCells (boardHash, countCellsToHide) {
        let allKeys = Object.keys(boardHash),
            newBoard = {},
            index;

        while (countCellsToHide > 0) {
            index = math.random(0, allKeys.length);
            allKeys.splice(index, 1);
            countCellsToHide -= 1;
        }

        allKeys.forEach((key) => {
            newBoard[key] = boardHash[key];
        });

        return newBoard;
    }

    convertSimpleBoardHashToParameters (boardHash, squares) {
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

    countVerticalSquares (size) {
        let verticalSquares = 2, // minimal possible value
            possibleVerticalSquares = parseInt(size / 2) - 1; // 16 / 2 = 8 (with height 2) - 1 = 7 ... will be 4 squares

        while (possibleVerticalSquares > 2) {
            if (size % possibleVerticalSquares === 0) {
                verticalSquares = possibleVerticalSquares;
                break;
            }
            possibleVerticalSquares--;
        }

        return verticalSquares;
    }

    countOffset (rowNumber, size) {
        let verticalSquares = this.countVerticalSquares(size),
            squareHeight = parseInt(size / verticalSquares),
            currentVerticalSquare = parseInt(rowNumber / squareHeight),
            offset = ((rowNumber * verticalSquares) + currentVerticalSquare) % size;

        return offset;
    }

    doOffset (row, offset) {
        let newRow = extend([], row);

        while (offset > 0) {
            newRow.unshift(newRow.pop());
            offset--;
        }

        return newRow;
    }

    transpose(array) {
        // @link http://stackoverflow.com/questions/4492678/to-swap-rows-with-columns-of-matrix-in-javascript-or-jquery

        // Calculate the width and height of the Array
        let width = array.length ? array.length : 0,
            height = array[0] instanceof Array ? array[0].length : 0,
            transposed = [];

        // In case it is a zero matrix, no transpose routine needed.
        if (height === 0 || width === 0) {
            return [];
        }

        // Loop through every item in the outer array (height)
        for (let i = 0; i < height; i++) {

            // Insert a new row (array)
            transposed[i] = [];

            // Loop through every item per item in outer array (width)
            for (let j = 0; j < width; j++) {

                // Save transposed data.
                transposed[i][j] = array[j][i];
            }
        }

        return transposed;
    }

}

module.exports = BoardGeneratorSimple;
