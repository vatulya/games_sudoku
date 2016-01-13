"use strict";

let getAllowedActionTypes = function () {
    let SudokuHistory = require('./../history'),
        types = SudokuHistory.getAllowedActionTypes();

    getAllowedActionTypes = function () {
        return types;
    };

    return types;
};

class Action {

    constructor (type, parameters) {
        let allowedTypes = getAllowedActionTypes();

        this.type = type || null;
        this.parameters = parameters || {};

        if (allowedTypes.indexOf(this.type) == -1) {
            throw new Error('History action error. Wrong type');
        }
        if (!Object.keys(this.parameters)) {
            throw new Error('History action error. Empty parameters');
        }
    }

}

module.exports = exports = Action;