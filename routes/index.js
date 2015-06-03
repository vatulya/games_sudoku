var express = require('express');
var router = express.Router();

var api = require('../libraries/games/api');

/* GET home page. */
router.get('/', function(req, res, next) {
    api.get('my/info', {}, function (data) {
        res.render('index', {
            title: 'Express',
            data: JSON.stringify(data)
        });
    });
});

router.get('/info', function(req, res, next) {
    api.get('my/info', {}, function (data) {
        res.render('index', {
            title: 'INFO',
            data: JSON.stringify(data)
        });
    });
});

module.exports = router;
