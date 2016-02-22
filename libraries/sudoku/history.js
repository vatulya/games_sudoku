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

    addAction (action) {
        return new Promise((fulfill, reject) => {
            if (!(action instanceof HistoryAction)) {
                return reject(new Error('Sudoku history error. Can\'t add action. Wrong type.'));
            }

            return this.storage.saveAction(action)
                .then(() => {
                    return fulfill();
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    getUndo () {
        return this.storage.getUndoAction() || {};
    }

    getRedo () {
        return this.storage.getRedoAction() || {};
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** STATIC METHODS ***/

    static create (gameHash) {
        return new Promise((fulfill, reject) => {
            let storage = new (HistoryStorage(HistoryStorage.ADAPTER_MONGOOSE))(gameHash, {model: ModelSudokuHistoryAction});

            storage.init()
                .then(() => {
                    return fulfill(new History(storage));
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    static load (gameHash) {
        return new Promise(function (fulfill, reject) {
            let storage = new (HistoryStorage(HistoryStorage.ADAPTER_MONGOOSE))(gameHash, {model: ModelSudokuHistoryAction});

            storage.init()
                .then(function () {
                    return fulfill(new History(storage), 'test2');
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    /********************************************** /STATIC METHODS ***/

}

module.exports = History;
