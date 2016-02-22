'use strict';

let HistoryAction = require('./../action');

/**
 * This is not finished class. You must extend it and overwrite some methods.
 */
class HistoryStorageAbstract {

    constructor (gameHash, parameters) {
        this.gameHash = gameHash;
        this.undo = {};
        this.redo = {};

        this._setParameters(parameters || {});
    }

    _setParameters (parameters) {
        // overwrite this method
        // here you can set some additional parameters
    }

    init (force) {
        return new Promise((fulfill, reject) => {
            if (!this.initialized || force) {
                console.log('History storage: init start (gameHash: "' + this.getGameHash() + '")' + (force ? ' FORCE' : ''));

                this.undo = {};
                this.redo = {};

                return this._init()
                    .then(() => {
                        return this._calcRedoUndo();
                    })
                    .then(() => {
                        this.initialized = true;

                        return fulfill();
                    })
                    .catch((error) => {
                        return reject(error);
                    });
            } else {
                return fulfill();
            }
        });
    }

    _init () {
        // overwrite this method
        // here you can load history for a long term storage
        return new Promise((fulfill, reject) => {
           return reject(new Error('AbstractStorage method error'));
        });
    }

    saveAction (action) {
        return new Promise((fulfill, reject) => {
            if (!(action instanceof HistoryAction)) {
                return reject(new Error('Save history action error. Wrong Action object'));
            }

            return this._save(action)
                .then(() => {
                    return this._calcRedoUndo();
                })
                .then(() => {
                    return fulfill();
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    _save (action) {
        // overwrite this method
        // here you can save action into long term storage
        return new Promise((fulfill, reject) => {
            return reject(new Error('AbstractStorage method error'));
        });
    }

    _calcRedoUndo () {
        // overwrite this method
        // here you can implement logic to calculate undo-redo moved and fill this.undo
        return new Promise((fulfill, reject) => {
            return reject(new Error('AbstractStorage method error'));
        });
    }

    getGameHash () {
        return this.gameHash;
    }

    getUndoAction () {
        if (!this.initialized) {
            throw new Error('History initialization error');
        }

        return this.undo || {};
    }

    getRedoAction () {
        if (!this.initialized) {
            throw new Error('History initialization error');
        }

        return this.redo || {};
    }

}

module.exports = HistoryStorageAbstract;
