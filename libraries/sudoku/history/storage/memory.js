"use strict";

let HistoryAbstractStorage = require('./abstract'),
    HistoryAction = require('./../action'),
    History = require('./../../history');

class HistoryMemoryStorage extends HistoryAbstractStorage {

    constructor (gameHash) {
        super(gameHash);
        this.actions = [];
    }

    _init (callback) {
        this.actions = [];
        callback(null);
    }

    _save (action, callback) {
        this.actions.push(action);
        callback(null);
    }

    _calcRedoUndo (callback) {
        let self = this,
            undoCount = 0,
            redoCount = 0;

        self.undo = {};
        self.redo = {};

        if (!self.actions.every(function (action) { return action instanceof HistoryAction; })) {
            return callback(new Error('History action error. Wrong action type.'));
        }

        self.actions.every(function (action) {
            let continueLoop = true; // you can change this var if you need break the loop. Example: Reach history limit.

            switch (action.type) {
                case History.ACTION_TYPE_SET_CELLS:
                case History.ACTION_TYPE_CLEAR_BOARD:
                    if (self.undo) {
                        continueLoop = false;
                    } else {
                        if (undoCount > 0) {
                            undoCount--;
                        } else {
                            if (!self.undo) {
                                self.undo = action;
                            }
                        }
                    }
                    break;

                case History.ACTION_TYPE_UNDO:
                    undoCount++;
                    if (redoCount > 0) {
                        redoCount--;
                    } else {
                        if (!self.redo) {
                            self.redo = action;
                        }
                    }
                    break;

                case History.ACTION_TYPE_REDO:
                    redoCount++;
                    if (undoCount > 0) {
                        undoCount--;
                    } else {
                        if (!self.undo) {
                            self.undo = action;
                        }
                    }
                    break;

                default:
                    // Unknown type. Ignore.
                    console.log('Unknown history action type: "' + action.type + '"');
                    break;
            }

            if (self.undo && self.redo) {
                continueLoop = false;
            }

            return continueLoop;
        });

        callback(null);
    }

}

module.exports = HistoryMemoryStorage;
