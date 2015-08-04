var mongoose = require('./../../mongoose');
var History = require('./../history');

var actionSchema = mongoose.Schema({
    historyId: mongoose.Schema.Types.ObjectId,
    action: {}
});

actionSchema.index({
    historyId: 1
});

module.exports = mongoose.model('sudoku_history_action', actionSchema);
