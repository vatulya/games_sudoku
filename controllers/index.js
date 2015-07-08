var router = require('express').Router();

router.get('/', function (req, res, next) {
    res.render('index/index', {
        title: 'Express INDEX'
    });
});

module.exports = router;
