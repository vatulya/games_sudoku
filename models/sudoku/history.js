var mongoose = require('./../mongoose');

var historySchema = mongoose.Schema({
    undo: {},
    redo: {}
});

historySchema.methods.getActionModels = function (callback) {
    this.model('sudoku_history_action').find({historyId: this.id}, callback);
};

module.exports = mongoose.model('sudoku_history', historySchema);
