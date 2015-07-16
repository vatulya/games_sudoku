var util = require('util');

var Group = require('./group');

function Col() {}
util.inherits(Col, Group);

Col.prototype.checkCellsStructure = function () {
    // TODO: check cells
    return true;
};