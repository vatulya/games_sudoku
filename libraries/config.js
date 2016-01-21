'use strict';

let nconf = require('nconf'),
    path = require('path'),

    configsPath = path.join(__dirname, '/../configs/'),

    env = process.env.APPLICATION_ENV || 'production';

nconf.env();
nconf.file(path.join(configsPath, 'global.json'));

nconf.file('env', path.join(configsPath, env + '.json'));

module.exports = nconf;

