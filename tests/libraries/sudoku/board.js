var given = require('mocha-testdata');
var sinon = require('sinon');
var should = require('should');

var SudokuBoard = require('../../../libraries/sudoku/board');

describe('libraries/sudoku/board', function () {

    describe('.getAllowedSizes', function () {

        it('must return correct sizes', function (done) {
            var sizes = SudokuBoard.getAllowedSizes();
            should(sizes).be.Array;
            var count = sizes.length;
            sizes.forEach(function (size) {
                should(size).be.above(0);
                count--;
                if (!count) {
                    done();
                }
            });
        });

    });

    describe('.generate', function () {

        var data = [0, 1, 4, 6, 9, 12, 15, 16, 'a', {}, true];
        given.async(data).it('must generate correct board object', function (done, size) {
            if (SudokuBoard.getAllowedSizes().indexOf(size) >= 0) {
                SudokuBoard.generate(size, function (error, board) {
                    should(error).be.empty;
                    should(board).be.Object;
                    should(Object.keys(board).length).be.equal(size * size);
                    for (var coords in board) {
                        if (board.hasOwnProperty(coords)) {
                            should(board[coords]).be.within(1, size); // 1..12
                            should(SudokuBoard.getCoordsArray(coords)).matchEach(function (value) {
                                should(value).be.within(1, size); // 1..12_1..12
                            });
                        }
                    }
                    should(SudokuBoard.validateBoardStructure(board)).be.true;
                    done();
                });
            } else {
                SudokuBoard.generate(size, function (error, board) {
                    should(error).be.Error;
                    done();
                });
            }
        });

    });

});