'use strict';

let HistoryStorageAbstract = require('./abstract'),
    HistoryAction = require('./../action'),
    History = require('./../../history');

class HistoryStorageMemory extends HistoryStorageAbstract {

    constructor(gameHash, parameters) {
        super(gameHash, parameters);
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
            revertedActions = self.actions.slice().reverse(), // copy array and reverse
            undoCount = 0,
            redoCount = 0;

        self.undo = {};
        self.redo = {};

        if (!revertedActions.every(function (action) { return (action instanceof HistoryAction); })) {
            return callback(new Error('History action error. Wrong action type.'));
        }

        revertedActions.every(function (action) {
            let continueLoop = true; // you can change this var if you need break the loop. Example: Reach history limit.

            switch (action.type) {
                case HistoryAction.ACTION_TYPE_SET_CELLS:
                case HistoryAction.ACTION_TYPE_CLEAR_BOARD:
                    if (Object.keys(self.undo).length) {
                        continueLoop = false;
                    } else {
                        if (undoCount > 0) {
                            undoCount--;
                        } else {
                            if (!Object.keys(self.undo).length) {
                                self.undo = action;
                            }
                        }
                    }
                    break;

                case HistoryAction.ACTION_TYPE_UNDO:
                    undoCount++;
                    if (redoCount > 0) {
                        redoCount--;
                    } else {
                        if (!Object.keys(self.redo).length) {
                            self.redo = action;
                        }
                    }
                    break;

                case HistoryAction.ACTION_TYPE_REDO:
                    redoCount++;
                    if (undoCount > 0) {
                        undoCount--;
                    } else {
                        if (!Object.keys(self.undo).length) {
                            self.undo = action;
                        }
                    }
                    break;

                default:
                    // Unknown type. Ignore.
                    console.log('Unknown history action type: "' + action.type + '"');
                    break;
            }

            if (Object.keys(self.undo).length && Object.keys(self.redo).length) {
                continueLoop = false;
            }

            return continueLoop;
        });

        callback(null);
    }

}

module.exports = HistoryStorageMemory;
