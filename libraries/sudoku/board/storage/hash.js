"use strict";

let extend = require('util')._extend;

let mongooseStorage = class {

    constructor(hash) {
        this.hash = hash;
    }

    getId() {
        return this.getParameter('id');
    }

    getParameter(parameter) {
        return this.hash[parameter];
    }

    save(parameters, callback) {
        extend(this.hash, parameters);
        callback(null);
    }

};

module.exports = mongooseStorage;
