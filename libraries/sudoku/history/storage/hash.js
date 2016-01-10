"use strict";

let AbstractStorage = require('./abstract');

class HashStorage extends AbstractStorage {

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

}

module.exports = HashStorage;
