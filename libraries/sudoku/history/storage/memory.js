'use strict';

let HistoryStorageAbstract = require('./abstract'),
    HistoryAction = require('./../action'),
    History = require('./../../history');

class HistoryStorageMemory extends HistoryStorageAbstract {

    constructor(gameHash, parameters) {
        super(gameHash, parameters);
        this.actions = [];
    }

    _init () {
        return new Promise((fulfill, reject) => {
            this.actions = [];
            return fulfill();
        });
    }

    _save (action) {
        return new Promise((fulfill, reject) => {
            this.actions.push(action);
            return fulfill();
        });
    }

    _calcRedoUndo () {
        return new Promise((fulfill, reject) => {
            let revertedActions = this.actions.slice().reverse(), // copy array and reverse
                undoCount = 0,
                redoCount = 0;

            this.undo = {};
            this.redo = {};

            if (!revertedActions.every((action) => { return (action instanceof HistoryAction); })) {
                return reject(new Error('History action error. Wrong action type.'));
            }

            revertedActions.every((action) => {
                let continueLoop = true; // you can change this var if you need break the loop. Example: Reach history limit.

                switch (action.type) {
                    case HistoryAction.ACTION_TYPE_SET_CELLS:
                    case HistoryAction.ACTION_TYPE_CLEAR_BOARD:
                        if (Object.keys(this.undo).length) {
                            continueLoop = false;
                        } else {
                            if (undoCount > 0) {
                                undoCount--;
                            } else {
                                if (!Object.keys(this.undo).length) {
                                    this.undo = action;
                                }
                            }
                        }
                        break;

                    case HistoryAction.ACTION_TYPE_UNDO:
                        undoCount++;
                        if (redoCount > 0) {
                            redoCount--;
                        } else {
                            if (!Object.keys(this.redo).length) {
                                this.redo = action;
                            }
                        }
                        break;

                    case HistoryAction.ACTION_TYPE_REDO:
                        redoCount++;
                        if (undoCount > 0) {
                            undoCount--;
                        } else {
                            if (!Object.keys(this.undo).length) {
                                this.undo = action;
                            }
                        }
                        break;

                    default:
                        // Unknown type. Ignore.
                        console.log('Unknown history action type: "' + action.type + '"');
                        break;
                }

                if (Object.keys(this.undo).length && Object.keys(this.redo).length) {
                    continueLoop = false;
                }

                return continueLoop;
            });

            return fulfill();
        });
    }

}

module.exports = HistoryStorageMemory;
