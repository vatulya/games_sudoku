'use strict';

let HistoryStorageMemory = require('./memory'),
    HistoryAction = require('./../action');

class HistoryStorageMongoose extends HistoryStorageMemory {

    _setParameters (parameters) {
        this.model = parameters.model;
        // Here must be check if this.model contains correct instance. But I don't know how to check Mongoose objects.
        return super._setParameters(parameters);
    }

    _init () {
        return new Promise((fulfill, reject) => {
            this.actions = [];

            //this.model.findByGameHash(this.gameHash, function (error, actionsRows) {
            this.model.find({gameHash: this.gameHash}, (error, actionsRows) => {
                if (error) {
                    return reject(error);
                }

                actionsRows.forEach((row) => {
                    this.actions.push(new HistoryAction(row.actionType, {
                        oldParameters: row.oldParameters,
                        newParameters: row.newParameters
                    }));
                });

                return fulfill();
            });
        });
    }

    _save (action) {
        return new Promise((fulfill, reject) => {
            let parameters = {
                    gameHash: this.gameHash,
                    created: new Date().getTime(),
                    actionType: action.type,
                    oldParameters: action.parameters.oldParameters,
                    newParameters: action.parameters.newParameters
                },
                storageAction = new this.model(parameters);

            storageAction.save((error) => {
                if (error) {
                    return reject(error);
                }

                return super._save(action)
                    .then(fulfill)
                    .catch(reject);
            });
        });
    }

}

module.exports = HistoryStorageMongoose;
