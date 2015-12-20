"use strict";

let mongooseStorage = class {

    constructor(model) {
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

};

module.exports = mongooseStorage;
