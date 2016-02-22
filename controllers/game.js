'use strict';

let router = require('express').Router(),

    Sudoku = require('../libraries/sudoku');

router.get('/', (req, res, next) => {
    res.render('index/index', {
        title: 'Express GAME'
    });
});

router.get('/:gameHash', (req, res, next) => {
    Sudoku.load(req.params.gameHash, true)
        .then((sudoku) => {
            return res.render('game/game', {
                'title': 'Sudoku',
                'gameSudoku': sudoku
            });
        })
        .catch((error) => {
            return next(error);
        });
});

module.exports = router;
