'use strict';

let router = require('express').Router();

router.get('/', (req, res, next) => {
    res.render('index/index', {
        title: 'Express INDEX'
    });
});

module.exports = router;
