"use strict";

class SudokuControlKeyboard {

    constructor (sudokuHash) {
        this.sudokuHash = sudokuHash;
        this.Sudoku = null; // Sudoku object

        this.init();
    }

    init () {
        this.initSudoku();
        this.initEvents();
    }

    initSudoku () {
        let sudokuContainerId = 'game-sudoku-' + this.sudokuHash,
            $sudokuContainer = $('#' + sudokuContainerId),
            Sudoku = $sudokuContainer.data('Sudoku');

        if (!$sudokuContainer.length) {
            throw new Error('Wrong Sudoku container "' + sudokuContainerId + '" for Numpad');
        }

        if (Sudoku) {
            this.Sudoku = Sudoku;
        }

        $sudokuContainer.on('Sudoku:initialize', (e, Sudoku) => {
            this.Sudoku = Sudoku;
        });
    }

    initEvents () {
        $(document)
            .on('keypress', (e) => {
                this.keyPress(e.charCode);
            })
        ;
    }

    keyPress (charCode) {
        let number = parseInt(String.fromCharCode(charCode)) || 0;

        if (charCode == 96 || charCode == 42) { // ~` OR *
            this.Sudoku.setMarkMode(!this.Sudoku.isMarkMode); // Toggle
        } else {
            this.Sudoku.checkNumber(number);
        }
    }

}
