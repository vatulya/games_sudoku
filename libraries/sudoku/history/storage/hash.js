"use strict";

let NullStorage = require('./null');

let hashStorage = class extends NullStorage {

    constructor(gameId, model) {
        super(gameId);
        this.model = model;
    }

    getParameter(parameter) {
        return this.hash[parameter];
    }

    save(parameters, callback) {
        extend(this.hash, parameters);
        callback(null);
    }

};

module.exports = hashStorage;
