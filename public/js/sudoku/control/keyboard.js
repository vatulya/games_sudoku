function SudokuControlKeyboard(sudokuHash) {
    this.sudokuHash = sudokuHash;
    this.Sudoku = null; // Sudoku object

    this.init();
}

SudokuControlKeyboard.prototype.init = function () {
    this.initSudoku();
    this.initEvents();
};

SudokuControlKeyboard.prototype.initSudoku = function () {
    var sudokuContainerId = 'game-sudoku-' + this.sudokuHash;
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

SudokuControlKeyboard.prototype.initEvents = function () {
    var self = this;

    $(document)
        .on('keypress', function (e) {
            self.keyPress(e.charCode);
        })
    ;
};

SudokuControlKeyboard.prototype.keyPress = function (charCode) {
    if (charCode == 96 || charCode == 42) { // ~` OR *
        this.Sudoku.isMarkMode = !this.Sudoku.isMarkMode; // Toggle
    } else {
        var number = parseInt(String.fromCharCode(charCode));
        this.Sudoku.checkNumber(number);
    }
};