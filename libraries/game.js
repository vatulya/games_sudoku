var gameModel = require('./model/game');

module.exports.loadByHash = function (hash, callback) {
    var field = {
        'a': 'b'
    };
    gameModel.findByHash(hash, callback);
};