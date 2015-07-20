var util = require('util');

var Group = require('./group');

function Row() {}
util.inherits(Row, Group);

Row.prototype.checkCellsStructure = function () {
    // TODO: check cells
    return true;
};

module.exports = Row;
