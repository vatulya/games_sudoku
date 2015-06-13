var ModelGame = require('./model/game');

module.exports.create = function (hash, callback) {
    var fields = {
        'a': 'b'
    };
    var modelGame = new ModelGame();
    modelGame.set('hash', hash);
    modelGame.save(function (error) {
        var game = new Game(modelGame);
        callback(game);
    });
};

module.exports.load = function (hash, callback) {
    ModelGame.findOne({'hash': hash}, function (error, modelGame) {
        var game = new Game(modelGame);
        callback(game);
    });
};

function Game (modelGame) {
    
}


