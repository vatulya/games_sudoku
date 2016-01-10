"use strict";

let Stack = require('stackjs');

let ModelSudokuHistoryAction = require('./../../models/sudoku/history/action'),
    StorageMongoose = require('./history/storage/mongoose'),
    Array = require('./../../helpers/array');

class History {

    constructor (storage) {
        this.storage = storage;

        this.init(History.getParametersFromStorage(storage));
    }

    /********************************************** INIT ***/

    init (parameters) {
        this.undo = parameters.undo || new Stack();
        this.redo = parameters.redo || new Stack();
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

    addAction (actionData, callback) {
        this.undo = actionData;
        this.redo = {};
        this._save(callback);
    }

    getUndo () {
        return this.storage.getUndo();
    }

    getRedo () {
        return this.storage.getRedo();
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** PROTECTED METHODS ***/

    _save (callback) {
        let parameters = {};
        this.storage.save(parameters, function (error) {
            if (error) { return callback(error); }
            callback(null);
        });
    }

    /********************************************** /PROTECTED METHODS ***/

    /********************************************** STATIC METHODS ***/

    static create (gameHash, callback) {
        let storage = new StorageMongoose(gameHash, ModelSudokuHistoryAction);

        storage.init(function (error) {
            if (error) return callback(error);
            callback(null, new History(storage));
        });
    }

    static load (gameHash, callback) {
        let storage = new StorageMongoose(gameHash, ModelSudokuHistoryAction);

        storage.init(function (error) {
            if (error) return callback(error);
            callback(null, new History(storage));
        });
    }

    static getParametersFromStorage (storage) {
        return {
            undo: storage.getUndo(),
            redo: storage.getRedo()
        };
    }

    /********************************************** /STATIC METHODS ***/

}

module.exports = History;
