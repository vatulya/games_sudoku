var CellCoords = require('./cell/coords');

/**
 * {
 *      coords: "1_2",
 *      squareNumber: 3,
 *      boardSize: 9,
 *      number: 0,
 *      isOpen: false,
 *      marks: [1, 3, 8]
 * }
 *
 * @param parameters
 * @constructor
 */
function Cell (parameters) {
    this.coords = null;
    this.squareNumber = 0;
    this.boardSize = 0;
    this._number = 0;
    this.isOpen = false;
    this.marks = [];

    this.init(parameters);
}

Cell.prototype.init = function (parameters) {
    this.coords = new CellCoords(parameters.coords || '');
    this.squareNumber = parseInt(parameters.squareNumber || 0);
    this.boardSize = parseInt(parameters.boardSize || 0);
    this._number = parseInt(parameters._number || 0);
    this.isOpen = !!(parameters.isOpen || false);
    this.marks = parameters.marks || [];

    if (!this.squareNumber || !this.boardSize) {
        throw new Error('Can\'t initialize Cell. Wrong parameters. Coords: "' + this.coords.toString() + '". Square: "' + this.squareNumber + '". Board size: "' + this.boardSize + '".');
    }
};

/***************** NUMBER ***/

Cell.prototype.setNumber = function (number) {
    if (!this.checkNumber(number)) throw new Error('Wrong number "' + number + '". Board size: "' + this.boardSize + '".');
    this._number = parseInt(number);
    return this;
};

Cell.prototype.checkNumber = function (number) {
    number = parseInt(number);
    return !!(0 < number && number <= this.boardSize);
};

/***************** /NUMBER ***/

/***************** MARK ***/

Cell.prototype.addMark = function (mark) {
    if (!this.checkNumber(mark)) throw new Error('Wrong mark "' + mark + '". Board size: "' + this.boardSize + '".');
    if (mark < 1) {
        return this;
    }
    if (!this.hasMark(mark)) {
        this.marks.push(parseInt(mark));
    }
    return this;
};

Cell.prototype.addMarks = function (marks) {
    var self = this;
    $.each(marks, function (i, mark) {
        self.addMark(mark);
    });
};

Cell.prototype.removeMark = function (mark) {
    if (this.hasMark(mark)) {
        mark = parseInt(mark);
        this.marks.slice(this.marks.indexOf(mark), 1);
    }
};

Cell.prototype.removeMarks = function (marks) {
    var self = this;
    $.each(marks, function (i, mark) {
        self.removeMark(mark);
    });
};

Cell.prototype.removeAllMarks = function () {
    for (var number = 1; number <= this.boardSize; number++) {
        this.removeClass('mark-' + number);
    }
};

Cell.prototype.setMarks = function (marks) {
    this.removeAllMarks();
    this.addMarks(marks);
};

Cell.prototype.toggleMark = function (mark) {
    mark = parseInt(mark);
    if (mark > 1) {
        this.container.hasClass('mark-' + mark) ? this.removeMark(mark) : this.addMark(mark);
    }
};

Cell.prototype.hasMark = function (mark) {
    mark = parseInt(mark);
    return (this.marks.indexOf(mark) > -1);
};

/***************** /MARK ***/

module.exports = Cell;
