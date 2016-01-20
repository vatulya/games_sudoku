"use strict";

let ModelSudokuHistoryAction = require('./../../../../models/sudoku/history/action'),
    HistoryStorageMemory = require('./memory'),
    HistoryAction = require('./../action');

class HistoryStorageMongoose extends HistoryStorageMemory {

    _setParameters (parameters) {
        this.model = parameters.model;
        // Here must be check if this.model contains correct instance. But I don't know how to check Mongoose objects.
        return super._setParameters(parameters);
    }

    _init (callback) {
        let self = this;

        self.actions = [];

        //this.model.findByGameHash(this.gameHash, function (error, actionsRows) {
        this.model.find({gameHash: this.gameHash}, function (error, actionsRows) {
            if (error) return callback(error);

            actionsRows.forEach(function (row) {
                self.actions.push(new HistoryAction(row.actionType, {
                    oldParameters: row.oldParameters,
                    newParameters: row.newParameters
                }));
            });

            callback(null);
        });
    }

    _save (action, callback) {
        let self = this,
            superSave = super._save.bind(this),
            storageAction = new this.model({
                gameHash: this.gameHash,
                created: new Date().getTime(),
                actionType: action.type,
                oldParameters: action.parameters.oldParameters,
                newParameters: action.parameters.newParameters
            });

        storageAction.save(function (error) {
            if (error) return callback(error);

            superSave(action, callback);
        });
    }

}

module.exports = HistoryStorageMongoose;
