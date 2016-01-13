"use strict";

let HistoryMemoryStorage = require('./memory'),
    HistoryAction = require('./../action');

class HistoryMongooseStorage extends HistoryMemoryStorage {

    constructor (gameId, model) {
        super(gameId);
        this.model = model;
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

module.exports = HistoryMongooseStorage;
