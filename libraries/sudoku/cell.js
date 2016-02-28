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
        this.coords = new CellCoords(parameters.coords || '');
        this.squareNumber = parseInt(parameters.squareNumber) || 0; // TODO: check if the first = "1"
        this.boardSize = parseInt(parameters.boardSize) || 0;
        this.number = parseInt(parameters.number);
        this.isOpen = !!(parameters.isOpen || false);
        this.marks = parameters.marks || [];

        if (this.squareNumber <=0 || this.boardSize <= 0 || !this.checkNumber(this.number)) {
            throw new Error('Can\'t initialize Cell. Wrong parameters. Coords: "' + this.coords.toString() + '".');
        }
    }

    /***************** NUMBER ***/

    setNumber (number) {
        if (this.checkNumber(number)) {
            this.number = parseInt(number);
            return true;
        }
        return false;
    }

    checkNumber (number) {
        number = parseInt(number);
        return (number >= 0 && number <= this.boardSize);
    }

    /***************** /NUMBER ***/

    /***************** MARK ***/

    addMark (mark) {
        if (this.checkNumber(mark)) {
            if (!this.hasMark(mark)) {
                this.marks.push(parseInt(mark));
            }
            return true;
        }
        return false;
    }

    addMarks (marks) {
        return marks.every(this.addMark.bind(this));
    }

    removeMark (mark) {
        if (this.hasMark(mark)) {
            this.marks.splice(this.marks.indexOf(+mark), 1);
            return true;
        }
        return false;
    }

    removeMarks (marks) {
        return marks.every(this.removeMark.bind(this));
    }

    removeAllMarks () {
        for (let mark = 1; mark <= this.boardSize; mark += 1) {
            this.removeMark(mark);
        }
        return true;
    }

    setMarks (marks) {
        this.removeAllMarks();
        return this.addMarks(marks);
    }

    toggleMark (mark) {
        if (this.checkNumber(mark)) {
            return this.hasMark(mark) ? this.removeMark(mark) : this.addMark(mark);
        }
        return false;
    }

    hasMark (mark) {
        return (this.marks.indexOf(parseInt(mark)) > -1);
    }

    /***************** /MARK ***/

}

module.exports = Cell;
