'use strict';

let math = require('./math');

let helper = {
    removeRandomKey: function (object) {
        delete object[Object.keys(object)[math.random(0, Object.keys(object).length)]];
    }
};


module.exports = helper;

