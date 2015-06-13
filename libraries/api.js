var url = require('url');
var query = require('querystring');
var crypto = require('crypto');
var request = require('request');
var extend = require('util')._extend;

var config = require('./config').get('api');
var configGlobal = require('./config');

var apiHost = config.host;
var apiKey = config.public_key;
var apiSecret = config.secret;

var protectedPaths = [
    '/sudoku/games/create'
];

module.exports.get = function (path, params, callback) {
    if (protectedPaths.indexOf(path) >= 0) {
        makeProtectedRequest(path, params, callback);
    } else {
        makeRequest(path, params, callback);
    }
};

function makeRequest(path, params, callback) {
    console.log('API REQUEST: ' + getUrl(path, params));
    request.get(getUrl(path, params), function (error, response, body) {
        if (error) {
            return callback(error);
        }
        if (response.statusCode != 200) {
            return callback(new Error('Response status code: "' + response.statusCode + '" [' + response.request.href + ']'));
        }
        return callback(null, JSON.parse(body));
    });
}

function makeProtectedRequest(path, params, callback) {
    makeRequest('/tokens/create', {}, function (error, response) {
        if (error || !response.token) {
            return callback(new Error('Protected API call error'));
        }
        params.token = response.token;
        makeRequest(path, params, callback);
    });
}

function getUrl(path, params) {
    var options = {
        protocol: 'http',
        host: apiHost,
        pathname: path,
        search: query.stringify(prepareParams(params || {}))
    };
    return url.format(options);
}

function generateCheckSum (params) {
    var keys = [];
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    keys.sort();

    var sortedParams = {};
    for (var i in keys) {
        key = keys[i];
        sortedParams[key] = params[key];
    }

    var md5 = crypto.createHash('md5');

    return md5.update(query.stringify(sortedParams) + apiSecret).digest('hex');
}

function prepareParams (params) {
    var prepared = extend({}, params);

    if (configGlobal.get('XDEBUG_SESSION_START')) {
        prepared['XDEBUG_SESSION_START'] = configGlobal.get('XDEBUG_SESSION_START');
    }

    prepared['api_key'] = apiKey;
    prepared['check_sum'] = generateCheckSum(prepared);
    return prepared;
}


