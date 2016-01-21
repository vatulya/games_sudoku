'use strict';

let router = require('express').Router(),

    Sudoku = require('../libraries/sudoku');

router.get('/', (req, res, next) => {
    res.render('index/index', {
        title: 'Express GAME'
    });
});

router.get('/:gameHash', (req, res, next) => {
    Sudoku.load(req.params.gameHash, (error, sudoku) => {
        if (error) { return next(error); }
        res.render('game/game', {
            'title': 'Sudoku',
            'gameSudoku': sudoku
        });
    }, true);
});

module.exports = router;
