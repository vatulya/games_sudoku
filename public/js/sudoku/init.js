// this file will initialize all Objects on the page

// Sudoku
$(document).ready(function() {
    $('.sudoku-table').each(function (i, el) {
        var Sudoku = initSudoku(el);

        // SudokuControlKeyboard
        new SudokuControlKeyboard(Sudoku.hash);
    });
});

// SudokuControlNumpad
$(document).ready(function() {
    $('.sudoku-numpad').each(function (i, el) {
        new SudokuControlNumpad(el);
    });
});
