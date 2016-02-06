'use strict';

let mongoose = require('./../../mongoose');

let actionSchema = mongoose.Schema({
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

actionSchema.static('findByGameHash', function (gameId, callback) {
    this.find({gameHash: gameId}, {sort: 'created'}, callback);
});

module.exports = mongoose.model('sudoku_history_action', actionSchema);
