"use strict";

let NullStorage = require('./null');

let mongooseStorage = class extends NullStorage {

    constructor (gameId, model) {
        super(gameId);
        this.model = model;
    }

    _init () {

    }

};

module.exports = mongooseStorage;
