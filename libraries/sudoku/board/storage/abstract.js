'use strict';

/**
 * This is not finished class. You must extend it and overwrite some methods.
 */
class BoardStorageAbstract {

    constructor () {
    }

    getId() {
        return null;
    }

    getParameter(parameter) {
        return null;
    }

    save(parameters) {
        return new Promise((fulfill, reject) => {
            return fulfill();
        });
    }

}

module.exports = BoardStorageAbstract;
