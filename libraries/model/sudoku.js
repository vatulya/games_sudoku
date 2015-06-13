var mongoose = require('./../mongoose');

var sudokuSchema = mongoose.Schema({
    hash: String,
    fields: {}
});

sudokuSchema.index({
    hash: 1
});

sudokuSchema.static('findOneByHash', function (hash, callback) {
    return this.findOne({hash: hash}, callback);
});

module.exports = mongoose.model('Sudoku', sudokuSchema);
