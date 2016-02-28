'use strict';

let BoardStorageAbstract = require('./abstract');

class BoardStorageMongoose extends BoardStorageAbstract {

    constructor (model) {
        super();
        this.model = model;
    }

    getId () {
        return this.getParameter('id');
    }

    getParameter (parameter) {
        return this.model.get(parameter);
    }

    save (parameters) {
        return new Promise((fulfill, reject) => {
            let allKeys = Object.keys(parameters);

            allKeys.forEach((key) => {
                this.model.set(key, parameters[key]);
            });

            return this.model.save((error) => {
                if (error) {
                    return reject(error);
                }

                return fulfill();
            });
        });
    }

}

module.exports = BoardStorageMongoose;
