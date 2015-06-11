var gameModel = require('./model/game');

module.exports.create = function (hash, callback) {
    var fields = {
        'a': 'b'
    };
    var game = new gameModel();
    game.hash = hash;
    game.fields = fields;
    game.save(function (error) {
        callback(game);
    });
};