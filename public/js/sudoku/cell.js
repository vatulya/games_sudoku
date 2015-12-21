function SudokuCell (container, boardSize) {
    this.container = $(container); // .cell
    this.boardSize = boardSize;

    // Private property. Use getter/setter for access
    this._number = parseInt(this.container.find('.number-container').html()) || 0;

    this.coords = new SudokuCellCoords(this);
    this.squareNumber = parseInt(this.getSquareFromCssClass(this.container.attr('class')));
}

SudokuCell.prototype.getNumber = function () {
    return this._number;
};

SudokuCell.prototype.setNumber = function (number) {
    this._number = parseInt(number);
    this.container.find('.number-container').html(this._number > 0 ? this._number : '');
    if (this._number > 0) {
        this.container.removeClass('empty');
    } else {
        this.container.addClass('empty');
    }
    return this;
};

SudokuCell.prototype.addMark = function (mark) {
    mark = parseInt(mark);
    if (mark > 1) {
        this.container.addClass('mark-' + mark);
    }
};

SudokuCell.prototype.addMarks = function (marks) {
    var self = this;
    $.each(marks, function (i, mark) {
        self.addMark(mark);
    });
};

SudokuCell.prototype.removeMark = function (mark) {
    mark = parseInt(mark);
    this.container.removeClass('mark-' + mark);
};

SudokuCell.prototype.removeMarks = function (marks) {
    var self = this;
    $.each(marks, function (i, mark) {
        self.removeMark(mark);
    });
};

SudokuCell.prototype.removeAllMarks = function () {
    for (var number = 1; number <= this.boardSize; number++) {
        this.container.removeClass('mark-' + number);
    }
};

SudokuCell.prototype.setMarks = function (marks) {
    this.removeAllMarks();
    this.addMarks(marks);
};

SudokuCell.prototype.toggleMark = function (mark) {
    mark = parseInt(mark);
    if (mark > 1) {
        this.container.hasClass('mark-' + mark) ? this.removeMark(mark) : this.addMark(mark);
    }
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
};

SudokuCell.prototype.hideMarks = function () {
    this.container.removeClass('marks');
};

SudokuCell.prototype.isOpen = function () {
    return !!this.container.hasClass('open');
};

SudokuCell.prototype.isEmpty = function () {
    return !!this.container.hasClass('empty');
};

SudokuCell.prototype.getSquareFromCssClass = function (cssClassesString) {
    return /square-([0-9]+)/.exec(cssClassesString)[1];
};

