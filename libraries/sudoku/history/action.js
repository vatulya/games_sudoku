"use strict";

let History = require('./../history');

class Action {

    constructor (parameters) {
        let allowedTypes = History.getAllowedActionTypes();

        this.type = parameters.type || null;
        this.newParameters = parameters.newParameters || {};
        this.oldParameters = parameters.oldParameters || {};

        if (allowedTypes.indexOf(this.type) == -1) {
            throw new Error('History action error. Wrong type');
        }
        if (!Object.keys(this.newParameters) && !Object.keys(this.oldParameters)) {
            throw new Error('History action error. Empty action');
        }
    }

}

module.exports = Action;