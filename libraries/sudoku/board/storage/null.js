"use strict";

let nullStorage = class {

    getId() {
        return null;
    }

    getParameter(parameter) {
        return null;
    }

    save(parameters, callback) {
        callback(null);
    }

};

module.exports = nullStorage;
