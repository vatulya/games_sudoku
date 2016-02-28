"use strict";

class SudokuControlNumpad {
    constructor (container) {
        this.container = $(container); // .sudoku-numpad
        this.Sudoku = null; // Sudoku object

        this.init();
    }

    init () {
        this.initSudoku();
        this.initEvents();
    }

    initSudoku () {
        let sudokuContainerId = 'game-sudoku-' + this.container.data('sudoku-hash'),
            $sudokuContainer = $('#' + sudokuContainerId),
            Sudoku = $sudokuContainer.data('Sudoku');

        if (!$sudokuContainer.length) {
            throw new Error('Wrong Sudoku container "' + sudokuContainerId + '" for Numpad');
        }

        if (Sudoku) {
            this.setSudoku(Sudoku);
        }

        $sudokuContainer.on('Sudoku:initialize', (e, Sudoku) => {
            this.setSudoku(Sudoku);
        });
    }

    setSudoku (Sudoku) {
        this.Sudoku = Sudoku;

        this.initSudokuEvents();
    }

    initEvents () {
        this.container
            .on('click', '.number', (e) => {
                let $el = $(e.currentTarget);
                if (!$el.hasClass('disabled')) {
                    this.Sudoku.checkNumber($el.data('number'));
                }
            })
            .on('click', '.check-field', () => {
                this.Sudoku.checkBoard();
            })
            .on('click', '.clear-field', () => {
                if (confirm('Вы действительно хотите очистить поле?\nЭто действие удалит все ваши ходы и пометки.')) {
                    this.Sudoku.clearBoard();
                }
            })
            .on('click', '.bot-start', () => {
                this.Sudoku.botStart();
            })
            .on('click', '.mark-mode', (e) => {
                e.stopImmediatePropagation();
                this.Sudoku.setMarkMode(!$(e.currentTarget).hasClass('active'));
            })
            .on('click', '.undo-move', (e) => {
                if (!$(e.currentTarget).hasClass('disabled')) {
                    this.Sudoku.useHistory('undo');
                }
            })
            .on('click', '.redo-move', (e) => {
                if (!$(e.currentTarget).hasClass('disabled')) {
                    this.Sudoku.useHistory('redo');
                }
            })

            // TODO: move into Popup class
            //.on('mouseover', '.sudoku-numpad.popup .number.enabled', function () {
            //    $(this).addClass('hover');
            //})
            //.on('mouseout', '.sudoku-numpad.popup .number.enabled', function () {
            //    self.Sudoku.table.find('.sudoku-numpad.popup .number.hover').removeClass('hover');
            //})
            //.on('mousedown', '.cell.open', function () {
            //    self.Sudoku.pushTimer = setTimeout(function () { $Sudoku.showPopupNumpad(); }, 500);
            //})
            //.on('mouseup', '.sudoku-numpad.popup .number.enabled', function () {
            //    self.Sudoku.mouseUp($(this));
            //})
            //.on('mouseup', function () {
            //    clearTimeout(self.Sudoku.pushTimer);
            //    self.Sudoku.table.find('.cell.pushed').removeClass('pushed');
            //    self.Sudoku.hidePopupNumpad();
            //})
        ;
    }

    initSudokuEvents () {
        this.Sudoku
            .on('allowedNumbersChanged', (allowedNumbers) => {
                this.container.find('.number').each((i, el) => {
                    let $el = $(el),
                        number = parseInt($el.data('number')) || 0;

                    if (allowedNumbers[number]) {
                        $el.removeClass('disabled').addClass('enabled');
                    } else {
                        $el.removeClass('enabled').addClass('disabled');
                    }
                });
            })
            .on('undoHistoryChanged', (isAllowed) => {
                let undoButton = this.container.find('.undo-move');

                if (undoButton.length) {
                    isAllowed ? undoButton.removeClass('disabled') : undoButton.addClass('disabled');
                }
            })
            .on('redoHistoryChanged', (isAllowed) => {
                let redoButton = this.container.find('.redo-move');

                if (redoButton.length) {
                    isAllowed ? redoButton.removeClass('disabled') : redoButton.addClass('disabled');
                }
            })
            .on('markModeChanged', (isMarkMode) => {
                let markModeButton = this.container.find('.mark-mode');

                if (isMarkMode) {
                    markModeButton.addClass('active');
                } else {
                    markModeButton.removeClass('active');
                }
            })
        ;
    }

}

$.extend(SudokuControlNumpad.prototype, MixinEvent);

// TODO: check this OLD code

SudokuControlNumpad.prototype.getPopupNumpad = function () {
    let $numpad = $Sudoku.table.find('.sudoku-numpad').clone().addClass('popup');
    $Sudoku.table.append($numpad);
    window.disableSelect($numpad);
    return $numpad;
};

SudokuControlNumpad.prototype.showPopupNumpad = function () {
    $Sudoku.hidePopupNumpad();
    var $cell = $Sudoku.table.find('.cell.pushed'),
        coords = $cell.position(),
        popupNumpad = $Sudoku.getPopupNumpad().show()
        ;
//                coords.top = coords.top - (popupNumpad.outerHeight() / 2)/* + $cell.outerHeight()*/;
//                coords.left = coords.left - (popupNumpad.outerWidth() / 2)/* + ($cell.outerWidth() / 2)*/;
//                popupNumpad.offset(coords);
    popupNumpad.css('position', 'absolute');
    popupNumpad.css('top', coords.top - (popupNumpad.outerHeight() / 2));
    popupNumpad.css('left', coords.left - (popupNumpad.outerWidth() / 2));
};

SudokuControlNumpad.prototype.hidePopupNumpad = function () {
    $Sudoku.table.find('.sudoku-numpad.popup').remove();
};
