"use strict";

class SudokuHistory {

    constructor (Sudoku) {
        this.Sudoku = Sudoku;

        this.undo = false;
        this.redo = false;
    }

    setUndo (move) {
        this.undo = $.isPlainObject(move) && !$.isEmptyObject(move) ? move : false;
        this.Sudoku.trigger('undoHistoryChanged', [!!this.undo]);
    }

    setRedo (move) {
        this.redo = $.isPlainObject(move) && !$.isEmptyObject(move) ? move : false;
        this.Sudoku.trigger('redoHistoryChanged', [!!this.redo]);
    }

    hasUndo () {
        return !!this.undo;
    }

    hasRedo () {
        return !!this.redo;
    }

    getUndo () {
        return this.undo;
    }

    getRedo () {
        return this.redo;
    }

    clear () {
        this.undo = false;
        this.redo = false;
    }

}
