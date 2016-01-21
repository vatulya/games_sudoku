'use strict';

let url = require('url'),
    qs = require('qs'),
    crypto = require('crypto'),
    request = require('request'),
    extend = require('util')._extend,

    config = require('./config').get('api'),
    configGlobal = require('./config'),

    apiHost = config.host,
    apiKey = config.public_key,
    apiSecret = config.secret,

    protectedPaths = [
        '/sudoku/games/create',
        '/test/protected' // for tests
    ];

module.exports.get = (path, params, callback) => {
    if (protectedPaths.indexOf(path) >= 0) {
        makeProtectedRequest(path, params, callback);
    } else {
        makeRequest(path, params, callback);
    }
};

function makeRequest(path, params, callback) {
    console.log('API REQUEST: ' + getUrl(path, params));
    request.get(getUrl(path, params), (error, response, body) => {
        if (error) { return callback(error); }

        if (response.statusCode != 200) {
            return callback(new Error('Response status code: "' + response.statusCode + '" [' + response.request.href + ']'));
        }
        return callback(null, JSON.parse(body));
    });
}

function makeProtectedRequest(path, params, callback) {
    makeRequest('/tokens/create', {}, (error, response) => {
        if (error || !response.token) { return callback(new Error('Protected API call error')); }

        params.token = response.token;
        makeRequest(path, params, callback);
    });
}

function getUrl(path, params) {
    let options = {
        protocol: 'http',
        host: apiHost,
        pathname: path,
        search: qs.stringify(prepareParams(params))
    };
    return url.format(options);
}

function generateCheckSum (params) {
    let keys = [],
        sortedParams = {},
        md5 = crypto.createHash('md5');

    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    keys.sort();

    keys.forEach((key) => {
        sortedParams[key] = params[key];
    });

    return md5.update(qs.stringify(sortedParams) + apiSecret).digest('hex');
}

function prepareParams (params) {
    let prepared = extend({}, params || {});

    if (configGlobal.get('XDEBUG_SESSION_START')) {
        prepared.XDEBUG_SESSION_START = configGlobal.get('XDEBUG_SESSION_START');
    }

    prepared.api_key = apiKey;
    prepared.check_sum = generateCheckSum(prepared);
    return prepared;
}


