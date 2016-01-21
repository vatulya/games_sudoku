'use strict';

let router = require('express').Router();

router.use('/', require('./index'));
router.use('/game/', require('./game'));

module.exports = router;
