"use strict";

let AbstractStorage = require('./abstract'),
    HistoryAction = require('./../action');

class MongooseStorage extends AbstractStorage {

    constructor (gameId, model) {
        super(gameId);
        this.model = model;
    }

    loadActions (callback) {
        this.model.findByGameHash(this.gameHash, function (error, actionsRows) {
            if (error) return callback(error);

            let actions = [];
            actionsRows.forEach(function (row) {
                actions.push(new HistoryAction({
                    type: row.actionType,
                    oldParameters: row.oldParameters,
                    newParameters: row.newParameters
                }));
            });

            callback(null, actions);
        });
    }

}

module.exports = MongooseStorage;
