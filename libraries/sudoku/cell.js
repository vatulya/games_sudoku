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
function Cell(parameters) {
    this.coords = null;
    this.squareNumber = 0;
    this.boardSize = 0;
    this.number = 0;
    this.isOpen = false;
    this.marks = [];

    this.init(parameters);
}

Cell.prototype.init = function (parameters) {
    this.coords = new CellCoords(parameters.coords || '');
    this.squareNumber = +parameters.squareNumber;
    this.boardSize = +parameters.boardSize;
    this.number = +parameters.number;
    this.isOpen = !!(parameters.isOpen || false);
    this.marks = parameters.marks || [];

    if (!this.squareNumber || !this.boardSize) {
        throw new Error('Can\'t initialize Cell. Wrong parameters. Coords: "' + this.coords.toString() + '". Square: "' + this.squareNumber + '". Board size: "' + this.boardSize + '".');
    }
};

/***************** NUMBER ***/

Cell.prototype.setNumber = function (number) {
    if (this.checkNumber(number)) {
        this.number = +number;
        return true;
    }
    return false;
};

Cell.prototype.checkNumber = function (number) {
    return !!(0 <= +number && +number <= this.boardSize);
};

/***************** /NUMBER ***/

/***************** MARK ***/

Cell.prototype.addMark = function (mark) {
    if (+mark && this.checkNumber(mark)) {
        if (!this.hasMark(mark)) {
            this.marks.push(+mark);
        }
        return true;
    }
    return false;
};

Cell.prototype.addMarks = function (marks) {
    return marks.every(this.addMark);
};

Cell.prototype.removeMark = function (mark) {
    if (this.hasMark(mark)) {
        this.marks.slice(this.marks.indexOf(+mark), 1);
        return true;
    }
    return false;
};

Cell.prototype.removeMarks = function (marks) {
    return marks.every(this.removeMark);
};

Cell.prototype.removeAllMarks = function () {
    var mark;
    for (mark = 1; mark <= this.boardSize; mark += 1) {
        if (!this.removeMark(mark)) {
            return false;
        }
    }
    return this;
};

Cell.prototype.setMarks = function (marks) {
    this.removeAllMarks();
    return this.addMarks(marks);
};

Cell.prototype.toggleMark = function (mark) {
    if (+mark && this.checkNumber(mark)) {
        return this.hasMark(mark) ? this.removeMark(mark) : this.addMark(mark);
    }
    return false;
};

Cell.prototype.hasMark = function (mark) {
    return (this.marks.indexOf(+mark) > -1);
};

/***************** /MARK ***/

module.exports = Cell;
