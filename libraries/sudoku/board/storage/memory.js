'use strict';

let extend = require('util')._extend,

    BoardStorageAbstract = require('./abstract');

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

    save(parameters) {
        return new Promise((fulfill, reject) => {
            extend(this.hash, parameters);
            return fulfill();
        });
    }

}

module.exports = BoardStorageMemory;
