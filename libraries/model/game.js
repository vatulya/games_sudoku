var mongoose = require('./../mongoose');

var gameSchema = mongoose.Schema({
    hash: String,
    fields: {}
});

gameSchema.methods.load = function (fields) {
    this.fields = fields;
};

gameSchema.static('findByHash', function (hash, callback) {
    return this.findOne({hash: hash}, callback);
});

module.exports = mongoose.model('Game', gameSchema);
