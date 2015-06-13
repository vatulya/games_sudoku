var config = require('./../libraries/config');

var core = {};

module.exports = function (env) {
    core.env = env;
    core.ws = config.get('ws');

    return function (req, res) {
        res.setHeader('Content-Type', 'text/javascript');
        res.end('Core = ' + JSON.stringify(core));
    };
};
