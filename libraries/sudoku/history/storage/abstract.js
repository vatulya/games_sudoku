"use strict";

let HistoryAction = require('./../action'),
    History = require('./../../history');

/**
 * This class is not finished and contains only main logic
 * You must extend this class - this is why name is "abstract"
 */
class AbstractStorage {

    constructor (gameHash) {
        this.gameHash = gameHash;
        this.initialized = false;
        this.undo = [];
        this.redo = [];
    }

    init (callback, force) {
        let self = this;

        if (!this.initialized || force) {
            console.log('History NullStorage: init start (gameHash: "' + this.getGameHash() + '")' + (force ? ' FORCE' : ''));

            this.undo = [];
            this.redo = [];

            this.loadActions(function (error, actions) {
                if (error) return callback (error);

                self.parseActions(actions, function (error, undo, redo) {
                    if (error) return callback (error);

                    self.undo = undo;
                    self.redo = redo;

                    self.initialized = true;
                    callback(null);
                });
            });
        } else {
            callback(null);
        }
    }

    loadActions (callback) {
        // overwrite this method
        callback(null, []);
    }

    parseActions (actions, callback) {
        let undo = [],
            redo = [],
            historyMovesCount = 0, // -1 when undo and +1 when redo
            noRedoMore = false;

        if (!actions.every(function (action) { return action instanceof HistoryAction; })) {
            return callback(new Error('History action error. Wrong action.'));
        }

        actions.every(function (action) {
            let continueLoop = true; // you can change this var if you need break the loop. Example: Reach history limit.

            switch (action.type) {
                case History.ACTION_TYPE_SET_CELLS:
                case History.ACTION_TYPE_CLEAR_BOARD:
                    if (historyMovesCount == 0) {
                        undo.push(action);
                    } else {
                        historyMovesCount++;
                    }
                    break;

                case History.ACTION_TYPE_UNDO:
                    historyMovesCount--;
                    if (!noRedoMore) {
                        redo.push(action);
                    }
                    break;

                case History.ACTION_TYPE_REDO:
                    historyMovesCount++;
                    break;

                default:
                    // Unknown type. Ignore.
                    console.log('Unknown history action type: "' + action.type + '"');
                    break;
            }

            if (historyMovesCount >= 0) {
                noRedoMore = true;
            }

            return continueLoop;
        });

        undo.reverse();
        redo.reverse();

        callback(null, undo, redo);
    }

    getGameHash () {
        return this.gameHash;
    }

    getActionForUndo () {
        if (!this.initialized) throw new Error('History initialization error');
        return this.undo[this.undo.length - 1] || {};
    }

    getActionForRedo () {
        if (!this.initialized) throw new Error('History initialization error');
        return this.redo[this.redo.length - 1] || {};
    }

}

module.exports = AbstractStorage;
