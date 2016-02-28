'use strict';

let mongoose = require('./../../mongoose'),

    a = function (x) {
        return JSON.stringify(x);
    },
    b = function (x) {
        return JSON.parse(x);
    },
    c = function (x) {
        return JSON.stringify(x);
    },
    d = function (x) {
        return JSON.parse(x);
    };

let actionSchema = mongoose.Schema({
    gameHash: mongoose.Schema.Types.String,
    created: Number,
    actionType: String,
    oldParameters: {
        type: String,
        default: '',
        set: a,
        get: b
    },
    newParameters: {
        type: String,
        default: '',
        set: c,
        get: d
    }
});

actionSchema.index({
    gameHash: 1,
    created: 1
});

actionSchema.static('findByGameHash', function (gameId, callback) {
    this.find({gameHash: gameId}, {sort: 'created'}, callback);
});

module.exports = mongoose.model('sudoku_history_action', actionSchema);
