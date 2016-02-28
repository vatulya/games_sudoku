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
        var sudokuContainerId = 'game-sudoku-' + this.container.data('sudoku-hash');
        var $sudokuContainer = $('#' + sudokuContainerId);
        if (!$sudokuContainer.length) {
            throw new Error('Wrong Sudoku container "' + sudokuContainerId + '" for Numpad');
        }

        var Sudoku = $sudokuContainer.data('Sudoku');
        if (Sudoku) {
            this.setSudoku(Sudoku);
        }

        var self = this;
        $sudokuContainer.on('Sudoku:initialize', function (e, Sudoku) {
            self.setSudoku(Sudoku);
        });
    }

    setSudoku (Sudoku) {
        this.Sudoku = Sudoku;

        this.initSudokuEvents();
    }

    initEvents () {
        var self = this;

        self.container
            .on('click', '.number', function () {
                var $el = $(this);
                if (!$el.hasClass('disabled')) {
                    self.Sudoku.checkNumber($el.data('number'));
                }
            })
            .on('click', '.check-field', function () {
                self.Sudoku.checkBoard();
            })
            .on('click', '.clear-field', function () {
                if (confirm('Вы действительно хотите очистить поле?\nЭто действие удалит все ваши ходы и пометки.')) {
                    self.Sudoku.clearBoard();
                }
            })
            .on('click', '.bot-start', function () {
                self.Sudoku.botStart();
            })
            .on('click', '.mark-mode', function () {
                self.Sudoku.markMode(!$(this).hasClass('active'));
            })
            .on('click', '.undo-move', function () {
                if (!$(this).hasClass('disabled')) {
                    self.Sudoku.useHistory('undo');
                }
            })
            .on('click', '.redo-move', function () {
                if (!$(this).hasClass('disabled')) {
                    self.Sudoku.useHistory('redo');
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
        var self = this;

        this.Sudoku
            .on('allowedNumbersChanged', function (allowedNumbers) {
                self.container.find('.number').each(function (i, el) {
                    var $el = $(el);
                    var number = parseInt($el.data('number'));
                    if (allowedNumbers[number]) {
                        $el.removeClass('disabled').addClass('enabled');
                    } else {
                        $el.removeClass('enabled').addClass('disabled');
                    }
                });
            })
            .on('undoHistoryChanged', function (isAllowed) {
                var undoButton = self.container.find('.undo-move');
                if (undoButton.length) {
                    isAllowed ? undoButton.removeClass('disabled') : undoButton.addClass('disabled');
                }
            })
            .on('redoHistoryChanged', function (isAllowed) {
                var redoButton = self.container.find('.redo-move');
                if (redoButton.length) {
                    isAllowed ? redoButton.removeClass('disabled') : redoButton.addClass('disabled');
                }
            })
        ;
    }

}

$.extend(SudokuControlNumpad.prototype, MixinEvent);

// TODO: check this OLD code

SudokuControlNumpad.prototype.getPopupNumpad = function () {
    var $numpad = $Sudoku.table.find('.sudoku-numpad').clone().addClass('popup');
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
