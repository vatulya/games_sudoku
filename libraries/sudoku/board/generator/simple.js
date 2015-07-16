var extend = require('util')._extend;
var math = require('./../../../../helpers/math');

var sizeMap = require('./../../board/sizesMap');
var Coords = require('./../../cell/coords');

var GeneratorSimple = {};

GeneratorSimple.generate = function (size, callback) {
    if (sizeMap.allowedSizes.indexOf(size) == -1) {
        return callback(new Error('Board size "' + size + '" is not allowed'));
    }

    GeneratorSimple.generateSimpleBoard(size, function (error, board) {
        if (error) return callback(error);
        GeneratorSimple.shuffleBoard(board, function (error, board) {
            if (error) return callback(error);
            GeneratorSimple.mergeBoardRows(board, function (error, board) {
                if (error) return callback(error);
                callback(null, board);
            });
        });
    });
};

GeneratorSimple.generateSimpleBoard = function (size, callback) {
    if (sizeMap.allowedSizes.indexOf(size) == -1) {
        return callback(new Error('Board size "' + size + '" is not allowed'));
    }
    var board = [];
    var row = Array.apply(null, Array(size)).map(function (_, i) { return i + 1; });
    for (var i = 0; i < size; i++) {
        board.push(doOffset(row, countOffset(i, size)));
    }

    callback(null, board);
};

GeneratorSimple.shuffleBoard = function (board, callback) {
    var iterations = 20;
    var possibleMethods = [
        'Transposing',
        'SwapRows',
        'SwapCols',
        'SwapSquareRows',
        'SwapSquareCols'
    ];
    var methodsCount = possibleMethods.length;
    var method = '';
    var previousMethod = null;
    for (var i = 0, j = 5; i < iterations; i++, j = 5) {
        do {
            method = possibleMethods[math.random(1, methodsCount) - 1];
        } while (method == previousMethod && j-- > 0);
        board = Board['shuffleBoardBy' + method](board);
        previousMethod = method;
    }
    callback(null, board);
};

GeneratorSimple.shuffleBoardByTransposing = function (board) {
    return transpose(board);
};

GeneratorSimple.shuffleBoardBySwapRows = function (board) {
    var size = board.length;
    var verticalSquares = countVerticalSquares(size);
    var squareHeight = parseInt(size / verticalSquares);
    var squareRowNumber = math.random(0, verticalSquares - 1);
    var rowNumber = math.random(0, squareHeight - 1);
    var switchRowNumber = parseInt((rowNumber + math.random(1, squareHeight - 1)) % squareHeight);
    var fromRowNumber = parseInt(squareRowNumber * squareHeight + rowNumber);
    var toRowNumber = parseInt(squareRowNumber * squareHeight + switchRowNumber);

    var newBoard = extend([], board);
    newBoard[toRowNumber] = board[fromRowNumber];
    newBoard[fromRowNumber] = board[toRowNumber];
    return newBoard;
};

GeneratorSimple.shuffleBoardBySwapCols = function (board) {
    var newBoard = [];
    newBoard = GeneratorSimple.shuffleBoardByTransposing(board);
    newBoard = GeneratorSimple.shuffleBoardBySwapRows(newBoard);
    newBoard = GeneratorSimple.shuffleBoardByTransposing(newBoard);
    return newBoard;
};

GeneratorSimple.shuffleBoardBySwapSquareRows = function (board) {
    var size = board.length;
    var verticalSquares = countVerticalSquares(size);
    var squareHeight = parseInt(size / verticalSquares);
    var squareNumber = math.random(0, verticalSquares - 1);
    var switchSquareNumber = parseInt((squareNumber + math.random(1, verticalSquares - 1)) % verticalSquares);
    var fromRow = parseInt(squareNumber * squareHeight);
    var toRow = parseInt(switchSquareNumber * squareHeight);

    var newBoard = extend([], board);
    for (var i = 0; i < squareHeight; i++) {
        newBoard[toRow + i] = board[fromRow + i];
        newBoard[fromRow + i] = board[toRow + i];
    }
    return newBoard;
};

GeneratorSimple.shuffleBoardBySwapSquareCols = function (board) {
    var newBoard = [];
    newBoard = GeneratorSimple.shuffleBoardByTransposing(board);
    newBoard = GeneratorSimple.shuffleBoardBySwapSquareRows(newBoard);
    newBoard = GeneratorSimple.shuffleBoardByTransposing(newBoard);
    return newBoard;
};

GeneratorSimple.mergeBoardRows = function (board, callback) {
    var mergedBoards = {};
    board.forEach(function (row, rowNumber) {
        row.forEach(function (value, colNumber) {
            var coords = new Coords(rowNumber + 1, colNumber + 1); // without zeros
            mergedBoards[coords.toString()] = value;
        });
    });
    callback(null, mergedBoards);
};


function countVerticalSquares (size) {
    var verticalSquares = 2; // minimal possible value
    var possibleVerticalSquares = parseInt(size / 2) - 1; // 16 / 2 = 8 (with height 2) - 1 = 7 ... will be 4 squares
    while (possibleVerticalSquares > 2) {
        if (!(size % possibleVerticalSquares)) {
            verticalSquares = possibleVerticalSquares;
            break;
        }
        possibleVerticalSquares--;
    }
    return verticalSquares;
}

function countOffset(rowNumber, size) {
    var verticalSquares = countVerticalSquares(size);
    //var squareWidth = verticalSquares; // size / (size / countVerticalSquares)
    var squareHeight = parseInt(size / verticalSquares);
    var currentVerticalSquare = parseInt(rowNumber / squareHeight);
    var offset = ((rowNumber * verticalSquares) + currentVerticalSquare) % size;
    return offset;
}

function doOffset (row, offset) {
    var newRow = extend([], row);
    while (offset > 0) {
        newRow.unshift(newRow.pop());
        offset--;
    }
    return newRow;
}

function transpose(array) {
    // @link http://stackoverflow.com/questions/4492678/to-swap-rows-with-columns-of-matrix-in-javascript-or-jquery

    // Calculate the width and height of the Array
    var width = array.length ? array.length : 0,
        height = array[0] instanceof Array ? array[0].length : 0;

    // In case it is a zero matrix, no transpose routine needed.
    if (height === 0 || width === 0) {
        return [];
    }

    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} transposed Transposed data is stored in this array.
     */
    var i, j, transposed = [];

    // Loop through every item in the outer array (height)
    for (i = 0; i < height; i++) {

        // Insert a new row (array)
        transposed[i] = [];

        // Loop through every item per item in outer array (width)
        for (j = 0; j < width; j++) {

            // Save transposed data.
            transposed[i][j] = array[j][i];
        }
    }

    return transposed;
}

module.exports = GeneratorSimple;
