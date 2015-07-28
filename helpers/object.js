var math = require('./math');

module.exports.removeRandomKey = function (object) {
    delete object[Object.keys(object)[math.random(0, Object.keys(object).length)]];
};