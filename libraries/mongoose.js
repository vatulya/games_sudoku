var mongoose = require('mongoose');
var config = require('./config').get('mongodb');

var connectPath = 'mongodb://' + config.host + '/' + config.db;
mongoose.connect(connectPath);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log('mongodb connected successfully');
});

module.exports = mongoose;
