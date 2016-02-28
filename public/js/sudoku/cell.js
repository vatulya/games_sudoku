'use strict';

function SudokuCell (container, boardSize) {
    this.container = $(container); // .cell
    this.boardSize = boardSize;

    // Private property. Use getter/setter for access
    this._number = parseInt(this.container.find('.number-container').html()) || 0;

    this.coords = new SudokuCellCoords(this);
    this.squareNumber = parseInt(this.getSquareFromCssClass(this.container.attr('class'))) || 0;
}

SudokuCell.prototype.getNumber = function () {
    return this._number;
};

SudokuCell.prototype.setNumber = function (number) {
    this._number = parseInt(number) || 0;
    this.container.find('.number-container').html(this._number > 0 ? this._number : '');
    if (this._number > 0) {
        this.container.removeClass('empty');
    } else {
        this.container.addClass('empty');
    }
    return this;
};

SudokuCell.prototype.hasMark = function (mark) {
    mark = parseInt(mark) || 0;
    return this.container.hasClass('mark-' + mark);
};

SudokuCell.prototype.addMark = function (mark) {
    mark = parseInt(mark) || 0;
    if (mark > 0) {
        this.container.addClass('mark-' + mark);
    }
    return this;
};

SudokuCell.prototype.addMarks = function (marks) {
    var self = this;
    $.each(marks, function (i, mark) {
        self.addMark(mark);
    });
    return this;
};

SudokuCell.prototype.removeMark = function (mark) {
    mark = parseInt(mark) || 0;
    if (mark) {
        this.container.removeClass('mark-' + mark);
    }
    return this;
};

SudokuCell.prototype.removeMarks = function (marks) {
    var self = this;
    $.each(marks, function (i, mark) {
        self.removeMark(mark);
    });
    return this;
};

SudokuCell.prototype.removeAllMarks = function () {
    for (var number = 1; number <= this.boardSize; number++) {
        this.container.removeClass('mark-' + number);
    }
    return this;
};

SudokuCell.prototype.setMarks = function (marks) {
    this.removeAllMarks();
    this.addMarks(marks);
    return this;
};

SudokuCell.prototype.getMarks = function () {
    var marks = [];
    for (var number = 1; number <= this.boardSize; number++) {
        if (this.container.hasClass('mark-' + number)) {
            marks.push(number);
        }
    }
    return marks;
};

SudokuCell.prototype.showMarks = function () {
    this.container.addClass('marks');
    return this;
};

SudokuCell.prototype.hideMarks = function () {
    this.container.removeClass('marks');
    return this;
};

SudokuCell.prototype.isOpen = function () {
    return this.container.hasClass('open');
};

SudokuCell.prototype.isEmpty = function () {
    return this.container.hasClass('empty');
};

SudokuCell.prototype.getSquareFromCssClass = function (cssClassesString) {
    return /square-([0-9]+)/.exec(cssClassesString)[1];
};

