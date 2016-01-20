'use strict';

let BoardStorageAbstract = require('./abstract');

class BoardStorageMongoose extends BoardStorageAbstract {

    constructor(model) {
        super();
        this.model = model;
    }

    getId() {
        return this.getParameter('id');
    }

    getParameter(parameter) {
        return this.model.get(parameter);
    }

    save(parameters, callback) {
        let self = this,
            allKeys = Object.keys(parameters);

        allKeys.forEach(function (key) {
            self.model.set(key, parameters[key]);
        });

        self.model.save(function (error) {
            if (error) { return callback(error); }
            callback(error);
        });
    }

}

module.exports = BoardStorageMongoose;
