"use strict";

let ModelSudokuHistoryAction = require('./../../models/sudoku/history/action'),
    HistoryStorage = require('./history/storage'),
    HistoryAction = require('./history/action');

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

    addAction (action, callback) {
        if (!(action instanceof HistoryAction)) {
            return callback (new Error('Sudoku history error. Can\'t add action. Wrong type.'));
        }

        this.storage.saveAction(action, callback);
    }

    getUndo () {
        return this.storage.getUndoAction() || {};
    }

    getRedo () {
        return this.storage.getRedoAction() || {};
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** STATIC METHODS ***/

    static create (gameHash, callback) {
        let storage = new (HistoryStorage(HistoryStorage.ADAPTER_MONGOOSE))(gameHash, {model: ModelSudokuHistoryAction});

        storage.init((error) => {
            if (error) { return callback(error); }

            callback(null, new History(storage));
        });
    }

    static load (gameHash, callback) {
        let storage = new (HistoryStorage(HistoryStorage.ADAPTER_MONGOOSE))(gameHash, {model: ModelSudokuHistoryAction});

        storage.init((error) => {
            if (error) { return callback(error); }

            callback(null, new History(storage));
        });
    }

    /********************************************** /STATIC METHODS ***/

}

module.exports = History;
