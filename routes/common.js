var express = require('express');
var router = express.Router();

var api = require('../libraries/api');
var gameModel = require('../libraries/model/game');

router.get('/', function (req, res, next) {
    api.get('my/info', {}, function (data) {
        res.render('index', {
            title: 'Express',
            data: JSON.stringify(data)
        });
    });
});

router.get('/create-game/:gameHash', function (req, res, next) {
    var gameHash = req.params.gameHash;
    var game = new gameModel({
        hash: gameHash,
        fields: {
            'a': 'b'
        }
    });
    game.save();
    res.end('thx');
});

router.get('/game/:gameHash', function (req, res, next) {
    var gameHash = req.params.gameHash;
    gameModel.findByHash(gameHash, function (err, game) {
        if (err || !game) throw new Error('Wrong model hash "' + gameHash + '"');
        res.render('game-board', {
            'title': 'Sudoku',
            'game': game
        });
    });
});

module.exports = router;
