"use strict";

let Group = require('./group');

let Col = class extends Group {

    checkCellsStructure () {
        // TODO: check cells
        return true;
    }

};

module.exports = Col;
