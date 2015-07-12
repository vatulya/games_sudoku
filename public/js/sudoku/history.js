function SudokuHistory (Sudoku) {
    this.Sudoku = Sudoku;

    this.undo = false;
    this.redo = false;
}

SudokuHistory.prototype.setUndo = function (move) {
    this.undo = $.isPlainObject(move) && !$.isEmptyObject(move) ? move : false;
    this.Sudoku.trigger('undoHistoryChanged', [!!this.undo]);
};

SudokuHistory.prototype.setRedo = function (move) {
    this.redo = $.isPlainObject(move) && !$.isEmptyObject(move) ? move : false;
    this.Sudoku.trigger('redoHistoryChanged', [!!this.redo]);
};

SudokuHistory.prototype.hasUndo = function () {
    return !!this.undo;
};

SudokuHistory.prototype.hasRedo = function () {
    return !!this.redo;
};

SudokuHistory.prototype.getUndo = function () {
    return this.undo;
};

SudokuHistory.prototype.getRedo = function () {
    return this.redo;
};

SudokuHistory.prototype.clear = function () {
    this.undo = false;
    this.redo = false;
};

SudokuHistory.prototype.useUndo = function () {
    this.use('undo');
};

SudokuHistory.prototype.useRedo = function () {
    this.use('redo');
};

SudokuHistory.prototype.use = function (historyType) {
    var self = this;
    var cells = false;
    if (historyType == 'undo') {
        cells = this.undo;
    } else if (historyType == 'redo') {
        cells = this.redo;
    } else {
        throw new Error('Can\'t use history. Wrong history type "' + historyType + '"');
    }

    if (!cells) {
        return false;
    }

    this.clear();
    $.each(cells, function (coords, data) {
        var Cell = self.Sudoku.board.findCell(coords);
        var number = typeof data['number'] != 'undefined' ? parseInt(data['number']) : undefined;
        var marks = typeof data['marks'] != 'undefined' ? data['marks'] : undefined;
        self.Sudoku.board.setCell(Cell, number, marks);
    });
    return true;
};
