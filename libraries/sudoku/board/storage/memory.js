'use strict';

let extend = require('util')._extend;

let BoardStorageAbstract = require('./abstract');

class BoardStorageMemory extends BoardStorageAbstract {

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

}

module.exports = BoardStorageMemory;
