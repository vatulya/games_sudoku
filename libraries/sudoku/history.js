var ModelSudokuHistory = require('./../../models/sudoku/history');

function History(model) {
    this.model = model;
    this.undo = {};
    this.redo = {};

    this.init();
}

/********************************************** INIT ***/

History.prototype.init = function () {
    // TODO: load data from mongo and set undo/redo
};

/********************************************** /INIT ***/

/********************************************** PUBLIC METHODS ***/

History.prototype.getId = function () {
    return this.model.id;
};

History.prototype.getDiff = function (fromCells, toCells) {
    var diff = {},
        cellKeys = [];

    cellKeys = Object.keys(fromCells);
    cellKeys.forEach(function (key) {
        diff[key] = +fromCells[key];
    });
    cellKeys = Object.keys(toCells);
    cellKeys.forEach(function (key) {
        diff[key] = +toCells[key];
    });
    return diff;
};

History.prototype.addAction = function (actionData) {
    this.undo = actionData;
    this.redo = {};
};

/********************************************** /PUBLIC METHODS ***/

/********************************************** STATIC METHODS ***/

History.create = function (callback) {
    var model = new ModelSudokuHistory();
    model.save(function (error) {
        if (error) { return callback(error); }

        callback(null, new History(model));
    });
};

History.load = function (id, callback) {
    ModelSudokuHistory.findById(id, function (error, model) {
        if (error) { return callback(error); }
        if (!model) { return callback(new Error('Wrong history ID')); }

        callback(null, new History(model));
    });
};

/********************************************** /STATIC METHODS ***/

module.exports = History;
