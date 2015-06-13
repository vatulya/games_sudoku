var sinon = require('sinon');
var api = require('./../../libraries/api');
var request = require('request');

describe('libraries/api', function () {

    before(function (done) {
        sinon.stub(request, 'get', function (url, callback) {
            var error = null;
            var response = {
                statusCode: 200,
                href: url
            };
            var body = JSON.stringify({url: url});

            callback(error, response, body);
        });
        done();
    });

    describe('.get', function () {
        it('must correct generate URL, call GET API, parse JSON and call callback', function (done) {
            api.get('/test/', {}, function (error, data) {
                done();
            });
        });
    });

    after(function (done) {
        request.get.restore();
        done();
    });
});