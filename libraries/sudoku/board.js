'use strict';

let ModelSudokuBoard = require('./../../models/sudoku/board'),
    BoardStorage = require('./board/storage'),
    BoardState = require('./board/state');

/**
 * @param BoardStorageAbstract storage
 * @constructor
 */
class SudokuBoard {

    /********************************************** STATIC METHODS ***/

    static create (parameters, callback) {
        let storage;

        storage = new (BoardStorage(BoardStorage.ADAPTER_MONGOOSE))(new ModelSudokuBoard());
        storage.save(parameters, (error) => {
            if (error) { return callback(error); }

            callback(null, new SudokuBoard(storage));
        });
    }

    static load (id, callback) {
        let storage,
            board;

        ModelSudokuBoard.findById(id, (error, model) => {
            if (error) { return callback(error); }
            if (!model) { return callback(new Error('Wrong board ID')); }

            storage = new (BoardStorage(BoardStorage.ADAPTER_MONGOOSE))(model);
            board = new SudokuBoard(storage);

            callback(null, board);
        });
    }

    /********************************************** /STATIC METHODS ***/

    /**
     * @param {BoardStorageAbstract} storage
     */
    constructor (storage) {
        this.storage = storage;
        this.state = new BoardState(this.getParametersFromStorage());
    }

    /********************************************** PUBLIC METHODS ***/

    getId () {
        return this.storage.getId();
    }

    getSize () {
        return this.state.size;
    }

    getCellByCoords (row, col) {
        return this.state.getCellByCoords(row, col);
    }

    apply (changes, callback) {
        let oldState = this.state.copy();

        if (!this.state.apply(changes.checkedCells || {}, changes.markedCells || {})) {
            callback(new Error('Board error. Can\'t apply changes.'));
        }

        this._save((error) => {
            if (error) { return callback(error); }

            callback(null, oldState.toHash(), this.state.toHash());
        });
    }

    clear (callback) {
        let oldState = this.state.copy();

        this.state.clear();

        this._save((error) => {
            if (error) { return callback(error); }

            callback(null, oldState.toHash(), this.state.toHash());
        });
    }

    diff (newParameters) {
        return this.state.diff(newParameters);
    }

    toHash () {
        return this.state.toHash();
    }

    getParametersFromStorage () {
        return {
            size: +this.storage.getParameter('size'),
            openedCells: this.storage.getParameter('openedCells') || {},
            checkedCells: this.storage.getParameter('checkedCells') || {},
            markedCells: this.storage.getParameter('markedCells') || {},
            squares: this.storage.getParameter('squares') || {}
        };
    }

    //isCorrectParameters (parameters) {
    //    if (this._isCorrectOpenedCells(parameters.openedCells || {})) {
    //        if (this._isCorrectCheckedCells(parameters.checkedCells || {})) {
    //            if (this._isCorrectMarkedCells(parameters.markedCells || {})) {
    //                return true;
    //            }
    //        }
    //    }
    //
    //    return false;
    //}

    isResolved () {
        return false;
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** PROTECTED METHODS ***/

    //_isCorrectOpenedCells (openedCells) {
    //    let self = this,
    //        keys = Object.keys(openedCells),
    //        isCorrect = function (key) {
    //            if (self.openedCells.hasOwnProperty(key)) { // board has the same opened cell
    //                if (+openedCells[key] === +self.openedCells[key].number) { // numbers are the same
    //                    return true;
    //                }
    //            }
    //            return false;
    //        };
    //
    //    if (!keys.length) {
    //        return true; // Allow when empty. We can skip this test because openedCells is static
    //    }
    //
    //    if (keys.length !== Object.keys(this.openedCells).length) {
    //        return false;
    //    }
    //
    //    return keys.every(isCorrect);
    //}
    //
    //_isCorrectCheckedCells (checkedCells) {
    //    let keys = Object.keys(checkedCells),
    //        isCorrect = (key) => {
    //            if (CellCoords.parse(key)) { // correct coords
    //                if (!this.state.openedCells.hasOwnProperty(key)) { // non-opened
    //                    if (this.state.checkNumber(checkedCells[key])) { // correct number
    //                        return true;
    //                    }
    //                }
    //            }
    //            return false;
    //        };
    //
    //    return keys.every(isCorrect);
    //}
    //
    //_isCorrectMarkedCells (markedCells) {
    //    let keys = Object.keys(markedCells),
    //        isCorrect = (key) => {
    //            if (CellCoords.parse(key)) { // correct coords
    //                if (!this.state.openedCells.hasOwnProperty(key)) { // non-opened
    //                    if (Array.isArray(markedCells[key])) {
    //                        if (markedCells[key].every(this.state.checkNumber)) { // each mark is correct number. zero allowed and will be filtered in setMark
    //                            return true;
    //                        }
    //                    }
    //                }
    //            }
    //            return false;
    //        };
    //
    //    return keys.every(isCorrect);
    //}

    _save (callback) {
        let hash = this.toHash(),
            parameters = {
                checkedCells: hash.checkedCells,
                markedCells: hash.markedCells
            };

        this.storage.save(parameters, callback);
    }

    /********************************************** /PROTECTED METHODS ***/

}

module.exports = SudokuBoard;
