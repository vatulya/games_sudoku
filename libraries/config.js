var nconf = require('nconf');
var path = require('path');

var configsPath = path.join(__dirname, '/../configs/');

nconf.env();
nconf.file(path.join(configsPath, 'global.json'));

var env = process.env.APPLICATION_ENV || 'production';
nconf.file(path.join(configsPath, env + '.json'));

module.exports = nconf;