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

    static create (parameters) {
        return new Promise((fulfill, reject) => {
            let storage = new (BoardStorage(BoardStorage.ADAPTER_MONGOOSE))(new ModelSudokuBoard());

            return storage.save(parameters)
                .then(() => {
                    return fulfill(new SudokuBoard(storage));
                }).catch((error) => {
                    return reject(error);
                });
        });
    }

    static load (id) {
        return new Promise((fulfill, reject) => {
            ModelSudokuBoard.findById(id, (error, model) => {
                let storage,
                    board;

                if (error) {
                    return reject(error);
                }
                if (!model) {
                    return reject(new Error('Wrong board ID'));
                }

                storage = new (BoardStorage(BoardStorage.ADAPTER_MONGOOSE))(model);
                board = new SudokuBoard(storage);

                return fulfill(board, 'test');
            });
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

    apply (changes) {
        return new Promise((fulfill, reject) => {
            let oldState = this.state.copy();

            if (!this.state.apply(changes.checkedCells || {}, changes.markedCells || {})) {
                return reject(new Error('Board error. Can\'t apply changes.'));
            }

            return this._save()
                .then(() => {
                    return fulfill(oldState.toHash(), this.state.toHash());
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    clear () {
        return new Promise((fulfill, reject) => {
            let oldState = this.state.copy();

            this.state.clear();

            return this._save()
                .then(() => {
                    return fulfill(oldState.toHash(), this.state.toHash());
                })
                .catch((error) => {
                    return reject(error);
                });
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

    _save () {
        return new Promise((fulfill, reject) => {
            let hash = this.toHash(),
                parameters = {
                    checkedCells: hash.checkedCells,
                    markedCells: hash.markedCells
                };

            return this.storage.save(parameters)
                .then(() => {
                    return fulfill();
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    /********************************************** /PROTECTED METHODS ***/

}

module.exports = SudokuBoard;
