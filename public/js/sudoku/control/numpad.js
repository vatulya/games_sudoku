function SudokuControlNumpad(container) {
    this.container = $(container); // .sudoku-numpad
    this.Sudoku = null; // Sudoku object

    this.initSudoku();
}

mixin(SudokuControlNumpad, MixinEvent);

SudokuControlNumpad.prototype.initSudoku = function () {
    var sudokuContainerId = 'game-sudoku-' + this.container.data('sudoku-hash');
    var $sudokuContainer = $('#' + sudokuContainerId);
    if (!$sudokuContainer.length) {
        throw new Error('Wrong Sudoku container "' + sudokuContainerId + '" for Numpad');
    }
    var Sudoku = $sudokuContainer.data('Sudoku');
    if (Sudoku) {
        this.Sudoku = Sudoku;
    }

    var self = this;
    $sudokuContainer.on('Sudoku:initialize', function (e, Sudoku) {
        self.Sudoku = Sudoku;
    });
};

$(document).ready(function() {
    $('.sudoku-numpad').each(function (i, el) {
        var Numpad = new SudokuControlNumpad(el);
    });
});
