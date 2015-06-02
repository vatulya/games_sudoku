var url = require('url');
var query = require('querystring');
var crypto = require('crypto');
var request = require('request');

var config = require('./../config').get('api');

var apiHost = config.host;
var apiKey = config.public_key;
var apiSecret = config.secret;

module.exports.get = function (path, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = {};
    }
    var options = {
        protocol: 'http',
        host: apiHost,
        pathname: path,
        search: query.stringify(prepareParams(params || {}))
    };

    request.get(url.format(options), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            callback({});
        }
    });
};

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

    var hasher = crypto.createHash('md5');

    return hasher.update(query.stringify(sortedParams) + apiSecret).digest('hex');;
}

function prepareParams (params) {
    params['api_key'] = apiKey;
    params['check_sum'] = generateCheckSum(params);
    return params;
}


