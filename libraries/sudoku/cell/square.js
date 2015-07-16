var util = require('util');

var Group = require('./group');

function Square() {}
util.inherits(Col, Group);

Square.prototype = new SudokuCellGroup();