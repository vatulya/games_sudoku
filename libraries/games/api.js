var config = require('./../config').get('api');
var url = require('url');
var query = require('querystring');
var crypto = require('crypto');
var httpsync = require('httpsync');

var apiHost = config.host;
var apiKey = config.public_key;
var apiSecret = config.secret;

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

module.exports.get = function (path, params) {
    var url = url.format({
        protocol: 'http',
        host: apiHost,
        pathname: path,
        search: query.stringify(prepareParams(params || {}))
    });
    var response = httpsync.get(url).end();
    var data = {};
    if (response.statusCode == 200) {
        data = JSON.parse(response.data.toString());
    }

    return data;
};
