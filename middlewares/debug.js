"use strict";

module.exports = function (env) {
    return function (req, res, next) {
        if (env == 'production') {
            console.log(process.memoryUsage());
        }
        next();
    };
};
