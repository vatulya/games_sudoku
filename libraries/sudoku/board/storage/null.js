"use strict";

let nullStorage = class {

    getId() {
        return null;
    }

    getParameter(parameter) {
        return null;
    }

    save(parameters, callback) {
        let keys = Object.keys(parameters);

        model.set('size', parameters.size);
        model.set('openedCells', parameters.openedCells);
        model.set('checkedCells', parameters.checkedCells);
        model.set('markedCells', parameters.markedCells);
        model.set('squares', parameters.squares);
        callback(null);
    }

};

module.exports = nullStorage;
