var router = require('express').Router();

router.use('/', require('./index'));
router.use('/game/', require('./game'));

//router.use('*', require('./error'));

//var express = require('express');
//express.use(require('./error'));

module.exports = router;
