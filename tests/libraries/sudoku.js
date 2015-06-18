var given = require('mocha-testdata');
var sinon = require('sinon');
var should = require('should');
var extend = require('util')._extend;

var Sudoku = require('./../../libraries/sudoku');
var ModelSudoku = require('./../../models/sudoku');

describe('libraries/sudoku', function () {

    describe('.create', function () {

        before(function (done) {
            sinon.stub(ModelSudoku.prototype, 'save', function (callback) {
                callback(null);
            });
            done();
        });

        var data = ['a', 0, '', 'd', 123, true, {}, []];
        given.async(data).it('must correct create new model and call callback OR throw error when wrong hash', function (done, hash) {
            Sudoku.create(hash, function (error, sudoku) {
                if (typeof hash == 'string' && hash) {
                    sudoku.getHash().should.be.equal(hash);
                } else {
                    should(error).be.Error;
                }
                done();
            });
        });

        after(function (done) {
            ModelSudoku.prototype.save.restore();
            done();
        });

    });

    describe('.create mongo error', function () {

        before(function (done) {
            sinon.stub(ModelSudoku.prototype, 'save', function (callback) {
                callback(new Error('some error'));
            });
            done();
        });

        it('must call callback with Error when mongo returns error', function (done) {
            Sudoku.create('test', function (error, sudoku) {
                should(error).be.Error;
                done();
            });
        });

        after(function (done) {
            ModelSudoku.prototype.save.restore();
            done();
        });

    });

    describe('.load', function () {

        before(function (done) {
            sinon.stub(ModelSudoku, 'findOneByHash', function (hash, callback) {
                if (typeof hash == 'string' && hash) {
                    if (hash == 'wrong hash') {
                        callback(null, null);
                    } else {
                        var modelSudoku = new ModelSudoku();
                        modelSudoku.hash = hash;
                        callback(null, modelSudoku);
                    }
                } else {
                    callback(new Error('wrong hash'));
                }
            });
            done();
        });

        var data = ['a', 0, '', 'd', 123, true, 'wrong hash', {}, []];
        given.async(data).it('must load correct Model or return error when wrong hash', function (done, hash) {
            Sudoku.load(hash, function (error, sudoku) {
                if (typeof hash == 'string' && hash && hash != 'wrong hash') {
                    should(sudoku.getHash()).be.equal(hash);
                } else {
                    should(error).be.Error;
                }
                done();
            });
        });

        after(function (done) {
            ModelSudoku.findOneByHash.restore();
            done();
        });

    });

    describe('.prototype', function () {

        describe('.generateBoard', function () {


        });

    });

});

