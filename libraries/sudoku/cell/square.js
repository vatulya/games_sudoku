var util = require('util');

var Group = require('./group');

function Square() {}
util.inherits(Square, Group);

Square.prototype.checkCellsStructure = function () {
    // TODO: check cells
    return true;
};

module.exports = Square;
