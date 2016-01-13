'use strict';

let Path = require('path');

/**
 * Usage example:
 * let Module = require('./path/module').dir(__dirname);
 * let OtherModule = Module('./otherModule');
 * ...
 * OtherModule().moduleLogic();
 * @type {{}}
 */

let modules = {};
let dir = '';

let Module = function (modulePath, forceLoad) {
    if (!modulePath || typeof modulePath != 'string') {
        throw new Error('Wrong module path "' + modulePath + '"');
    }
    modulePath = Path.resolve(dir, modulePath);

    if (!modules[modulePath]) {
        modules[modulePath] = modulePath;
    }

    if (forceLoad) {
        Module.load(modulePath);
    }

    return (function (p) {
        return function () {
            if (typeof modules[p] === 'string') {
                Module.load(p);
            }
            return modules[p];
        }
    })(modulePath);
};

Module.load = function (path) {
    modules[path] = require(path);
};

Module.dir = function (dirPath) {
    dir = dirPath;
    return Module;
};

module.exports = Module;