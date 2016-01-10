"use strict";

let Group = require('./group');

let Row = class extends Group {

    checkCellsStructure () {
        // TODO: check cells
        return true;
    }

};

module.exports = Row;
