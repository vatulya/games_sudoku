"use strict";

let CellCoords = require('./cell/coords');

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
class Cell {

    constructor (parameters) {
        this.coords = null;
        this.squareNumber = 0;
        this.boardSize = 0;
        this.number = 0;
        this.isOpen = false;
        this.marks = [];

        this.init(parameters);
    }

    init (parameters) {
        this.coords = new CellCoords(parameters.coords || '');
        this.squareNumber = +parameters.squareNumber;
        this.boardSize = +parameters.boardSize;
        this.number = +parameters.number;
        this.isOpen = !!(parameters.isOpen || false);
        this.marks = parameters.marks || [];

        if (!this.squareNumber || !this.boardSize) {
            throw new Error('Can\'t initialize Cell. Wrong parameters. Coords: "' + this.coords.toString() + '". Square: "' + this.squareNumber + '". Board size: "' + this.boardSize + '".');
        }
    }

    /***************** NUMBER ***/

    setNumber (number) {
        if (this.checkNumber(number)) {
            this.number = +number;
            return true;
        }
        return false;
    }

    checkNumber (number) {
        return !!(0 <= +number && +number <= this.boardSize);
    }

    /***************** /NUMBER ***/

    /***************** MARK ***/

    addMark (mark) {
        if (+mark && this.checkNumber(mark)) {
            if (!this.hasMark(mark)) {
                this.marks.push(+mark);
            }
            return true;
        }
        return false;
    }

    addMarks (marks) {
        return marks.every(this.addMark);
    }

    removeMark (mark) {
        if (this.hasMark(mark)) {
            this.marks.slice(this.marks.indexOf(+mark), 1);
            return true;
        }
        return false;
    }

    removeMarks (marks) {
        return marks.every(this.removeMark);
    }

    removeAllMarks () {
        var mark;
        for (mark = 1; mark <= this.boardSize; mark += 1) {
            if (!this.removeMark(mark)) {
                return false;
            }
        }
        return this;
    }

    setMarks (marks) {
        this.removeAllMarks();
        return this.addMarks(marks);
    }

    toggleMark (mark) {
        if (+mark && this.checkNumber(mark)) {
            return this.hasMark(mark) ? this.removeMark(mark) : this.addMark(mark);
        }
        return false;
    }

    hasMark (mark) {
        return (this.marks.indexOf(+mark) > -1);
    }

    /***************** /MARK ***/

}

module.exports = Cell;
