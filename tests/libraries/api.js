var given = require('mocha-testdata');
var sinon = require('sinon');
var should = require('should');
var request = require('request');
var query = require('querystring');
var url = require('url');
var api = require('./../../libraries/api');

describe('libraries/api', function () {

    describe('.get', function () {

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

        var data = [
            ['/test/', {}],
            ['/test2/', {a: 'a'}],
            ['/test3/', {b: 'b'/*, c: {ca: 'c'}*/}]
        ];
        given.async(data).it('must correct generate URL, call GET API, parse JSON and call callback', function (done, path, params) {
            api.get(path, params, function (error, data) {
                var resultUrl = url.parse(data.url);
                var resultParams = query.parse(resultUrl.query);
                resultUrl.pathname.should.be.equal(path);
                for (var i in params) {
                    if (params.hasOwnProperty(i) && !params[i]) {
                        resultParams[i].should.be.equal(params[i], 'all query keys must be equal');
                    }
                }
                resultParams.should.have.property('api_key').and.be.not.empty;
                resultParams.should.have.property('check_sum').and.be.not.empty;
                done();
            });
        });

        after(function (done) {
            request.get.restore();
            done();
        });

    });

});