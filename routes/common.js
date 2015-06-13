var express = require('express');
var router = express.Router();

var api = require('../libraries/api');
var game = require('../libraries/game');

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/game/:gameHash', function (req, res, next) {
    var gameHash = req.params.gameHash;
    game.load(gameHash, function (err, sudoku) {
        if (err || !sudoku) throw new Error('Wrong model hash "' + gameHash + '"');
        res.render('game-board', {
            'title': 'Sudoku',
            'game': sudoku
        });
    });
});

module.exports = router;
