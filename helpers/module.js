'use strict';

let Path = require('path');

/**
 * Usage example:
 * let Module = require('./path/module').dir(__dirname);
 * let OtherModule = Module('./otherModule');
 * ...
 * OtherModule().moduleLogic();
 * obj = new (OtherModule())(constructorParams);
 * @type {{}}
 */

let modules = {},
    dir = '';

let Module = function (modulePath, forceLoad) {
    if (!modulePath || typeof modulePath != 'string') {
        throw new Error('Wrong module path "' + modulePath + '"');
    }

    // NOT TESTED
    let moduleAbsPath = Path.resolve(dir, modulePath);

    if (!modules[moduleAbsPath]) {
        modules[moduleAbsPath] = moduleAbsPath;
    }

    if (forceLoad) {
        Module.load(moduleAbsPath);
    }

    return () => {
        if (typeof modules[moduleAbsPath] === 'string') {
            Module.load(moduleAbsPath);
        }
        return modules[moduleAbsPath];
    };
};

Module.load = function (path) {
    modules[path] = require(path);
};

Module.dir = function (dirPath) {
    dir = dirPath;
    return Module;
};

module.exports = Module;