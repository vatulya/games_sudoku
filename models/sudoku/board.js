'use strict';

let mongoose = require('./../mongoose'),

    arrayHelper = require('./../../helpers/array');

let markedCellsToString = function (marksObject) {
        let marksString,
            arrayOfCells = [],
            keys = Object.keys(marksObject);

        if (keys.length) {
            keys.forEach((key) => {
                arrayOfCells.push(key + ':' + marksObject[key].join(','));
            });
        }

        marksString = arrayOfCells.join(';');

        // coords:mark,mark,mark;coords:mark;coords:;coords:;
        return marksString;
    },
    markedCellsToObject = function (marksString) {
        let marksObject = {},
            arrayCells = marksString === '' ? [] : marksString.split(';');

        // coords:mark,mark,mark
        arrayCells.forEach((stringCell) => {
            // coords, marks
            let parts = stringCell.trim().split(':'),
                arrayMarks = [];

            if (parts.length === 2) {
                // mark , mark
                arrayMarks = parts[1].trim().split(',');
            }

            arrayMarks.forEach((value, i, theArray) => {
                theArray[i] = parseInt(value.trim()) || 0;
            });
            arrayMarks = arrayHelper.unique(arrayMarks);

            marksObject[parts[0]] = arrayMarks;
        });

        return marksObject;
    };

let boardSchema = mongoose.Schema({
    size: Number,
    openedCells: {},
    checkedCells: {},
    markedCells: {
        type: String,
        default: '',
        set: markedCellsToString,
        get: markedCellsToObject
    },
    squares: {}
});

module.exports = mongoose.model('sudoku_board', boardSchema);
