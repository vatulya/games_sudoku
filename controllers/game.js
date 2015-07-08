var router = require('express').Router();

var api = require('../libraries/api');
var Sudoku = require('../libraries/sudoku');

router.get('/', function (req, res, next) {
    res.render('index/index', {
        title: 'Express GAME'
    });
});

router.get('/:gameHash', function (req, res, next) {
    var gameHash = req.params.gameHash;
    Sudoku.load(gameHash, function (error, sudoku) {
        if (error) return next(error);
        res.render('game/game', {
            'title': 'Sudoku',
            'gameSudoku': sudoku
        });
    });
});

module.exports = router;
