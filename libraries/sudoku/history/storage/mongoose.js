"use strict";

let Mongoose = require('mongoose'),
    HistoryStorageMemory = require('./memory'),
    HistoryAction = require('./../action');

class HistoryStorageMongoose extends HistoryStorageMemory {

    _setParameters (parameters = {}) {
        this.model = parameters.model;
        if (!this.model.base instanceof Mongoose) {
            throw new Error('History storage Mongoose error. Wrong parameter.model type');
        }

        return super._setParameters(parameters);
    }

    _init (callback) {
        let self = this;

        self.actions = [];

        this.model.findByGameHash(this.gameHash, function (error, actionsRows) {
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

}

module.exports = HistoryStorageMongoose;
