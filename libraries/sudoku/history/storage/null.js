"use strict";

let Stack = require('stackjs');

let nullStorage = class {

    constructor (gameId) {
        this.gameId = gameId;
        this.initialized = false;
        this.undo = new Stack();
        this.redo = new Stack();
    }

    init (callback, force) {
        if (!this.initialized || force) {
            console.log('History nullStorage: init start (gameId: "' + this.getGameId() + '")' + (force ? ' FORCE' : ''));

            this._init();

            this.initialized = true;
        }
        callback(null);
    }

    _init () {
        // overwrite this method
    }

    getGameId () {
        return this.gameId;
    }

    getUndo () {
        if (!this.initialized) throw new Error('History initialization error');
        return this._getUndo();
    }

    _getUndo () {
        // overwrite this method
    }

    getRedo () {
        if (!this.initialized) throw new Error('History initialization error');
        return this._getRedo();
    }

    _getRedo () {
        // overwrite this method
    }

};

module.exports = nullStorage;
