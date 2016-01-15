'use strict';

class HistoryAction {

    constructor (type, parameters) {
        this.type = type || null;
        this.parameters = parameters || {};

        if (HistoryAction.getAllowedActionTypes().indexOf(this.type) == -1) {
            throw new Error('History action error. Wrong type');
        }
        if (!Object.keys(this.parameters)) {
            throw new Error('History action error. Empty parameters');
        }
    }

    static getAllowedActionTypes () {
        return [
            HistoryAction.ACTION_TYPE_SET_CELLS,
            HistoryAction.ACTION_TYPE_CLEAR_BOARD,
            HistoryAction.ACTION_TYPE_UNDO,
            HistoryAction.ACTION_TYPE_REDO
        ];
    }

}

HistoryAction.ACTION_TYPE_SET_CELLS = 'setCells';
HistoryAction.ACTION_TYPE_CLEAR_BOARD = 'clearBoard';
HistoryAction.ACTION_TYPE_UNDO = 'undo';
HistoryAction.ACTION_TYPE_REDO = 'redo';

module.exports = HistoryAction;