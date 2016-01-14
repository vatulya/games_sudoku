"use strict";

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

    init (callback, force) {
        let self = this;

        if (!this.initialized || force) {
            console.log('History storage: init start (gameHash: "' + this.getGameHash() + '")' + (force ? ' FORCE' : ''));

            self.undo = {};
            self.redo = {};

            this._init(function (error) {
                if (error) return callback (error);

                self._calcRedoUndo(function (error) {
                    if (error) return callback (error);

                    self.initialized = true;

                    callback(null);
                });
            });
        } else {
            callback(null);
        }
    }

    _init (callback) {
        // overwrite this method
        // here you can load history for long term storage
        callback(new Error('AbstractStorage method error'));
    }

    saveAction (action, callback) {
        let self = this;

        if (!action instanceof HistoryAction) return callback(new Error('Save history action error. Wrong Action object'));

        this._save(action, function (error) {
            if (error) return callback(error);

            self._calcRedoUndo(function (error) {
                if (error) return callback (error);

                callback(null);
            });
        });
    }

    _save (action, callback) {
        // overwrite this method
        // here you can save action into long term storage
        callback(new Error('AbstractStorage method error'));
    }

    _calcRedoUndo (callback) {
        // overwrite this method
        // here you can implement logic to calculate undo-redo moved and fill this.undo
        callback(new Error('AbstractStorage method error'));
    }

    getGameHash () {
        return this.gameHash;
    }

    getUndoAction () {
        if (!this.initialized) throw new Error('History initialization error');
        return this.undo || {};
    }

    getRedoAction () {
        if (!this.initialized) throw new Error('History initialization error');
        return this.redo || {};
    }

}

module.exports = HistoryStorageAbstract;
