"use strict";

let ModelSudokuHistoryAction = require('./../../models/sudoku/history/action'),
    HistoryStorage = require('./history/storage'),
    HistoryAction = require('./history/action'),
    Array = require('./../../helpers/array');

class History {

    constructor (storage) {
        this.storage = storage;

        this.init();
    }

    /********************************************** INIT ***/

    init () {
        // nothing
    };

    /********************************************** /INIT ***/

    /********************************************** PUBLIC METHODS ***/

    getId () {
        return this.storage.getId();
    }

    getDiff (fromCells, toCells) {
        let diff = {
                checkedCells: {},
                markedCells: {}
            },
            cellKeys = [];

        cellKeys = Object.keys(fromCells).concat(Object.keys(toCells));
        cellKeys = Array.unique(cellKeys);
        cellKeys.forEach(function (key) {
            if (fromCells.hasOwnProperty(key) && !toCells.hasOwnProperty(key)) {
                diff.checkedCells[key] = 0;
                diff.markedCells[key] = [];
            } else if (!fromCells.hasOwnProperty(key) && toCells.hasOwnProperty(key)) {
                if (+toCells[key].number) {
                    diff.checkedCells[key] = +toCells[key].number;
                }
                if (toCells[key].marks.length) {
                    diff.markedCells[key] = toCells[key].marks;
                }
            } else {
                if (+fromCells[key].number !== +toCells[key].number) {
                    diff.checkedCells[key] = +toCells[key].number;
                }
                if (Array.isDifferent(fromCells[key].marks, toCells[key].marks)) {
                    diff.markedCells[key] = toCells[key].marks;
                }
            }
        });
        return diff;
    }

    actionSetCells (oldParameters, newParameters, callback) {
        let action = new HistoryAction(HistoryAction.ACTION_TYPE_SET_CELLS, {
            oldParameters: oldParameters,
            newParameters: newParameters
        });
        this.storage.saveAction(action, callback);
    }

    actionClearBoard (oldParameters, newParameters, callback) {
        let action = new HistoryAction(HistoryAction.ACTION_TYPE_CLEAR_BOARD, {
            oldParameters: oldParameters,
            newParameters: newParameters
        });
        this.storage.saveAction(action, callback);
    }

    actionDoUndo (callback) {
        let action = this.storage.getUndoAction();

        if (!action instanceof HistoryAction) {
            // No undo move
            callback(null);
        }

        action = new HistoryAction(HistoryAction.ACTION_TYPE_UNDO, {
            oldParameters: action.parameters.newParameters,
            newParameters: action.parameters.oldParameters
        });
        this.storage.saveAction(action, callback);
    }

    actionDoRedo (callback) {
        let action = this.storage.getRedoAction();

        if (!action instanceof HistoryAction) {
            // No redo move
            callback(null);
        }

        action = new HistoryAction(HistoryAction.ACTION_TYPE_REDO, {
            oldParameters: action.parameters.newParameters,
            newParameters: action.parameters.oldParameters
        });
        this.storage.saveAction(action, callback);
    }

    getUndo () {
        let action = this.storage.getUndoAction();
        return action instanceof HistoryAction ? action.parameters.oldParameters : {};
    }

    getRedo () {
        let action = this.storage.getRedoAction();
        return action instanceof HistoryAction ? action.parameters.oldParameters : {};
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** STATIC METHODS ***/

    static create (gameHash, callback) {
        let storage = new (HistoryStorage('memory'))(gameHash, {model: ModelSudokuHistoryAction});

        storage.init(function (error) {
            if (error) return callback(error);
            callback(null, new History(storage));
        });
    }

    static load (gameHash, callback) {
        let storage = new (HistoryStorage('memory'))(gameHash, {model: ModelSudokuHistoryAction});

        storage.init(function (error) {
            if (error) return callback(error);
            callback(null, new History(storage));
        });
    }

    /********************************************** /STATIC METHODS ***/

}

module.exports = History;
