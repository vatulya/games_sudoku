var mongoose = require('./../../mongoose');

var actionSchema = mongoose.Schema({
    gameHash: mongoose.Schema.Types.String,
    created: Number,
    actionType: String,
    oldParameters: {},
    newParameters: {}
});

actionSchema.index({
    gameHash: 1,
    created: 1
});

module.exports = mongoose.model('sudoku_history_action', actionSchema);
