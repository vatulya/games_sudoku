var given = require('mocha-testdata');
var sinon = require('sinon');
var request = require('request');
var qs = require('qs');
var should = require('should');
var extend = require('util')._extend;
var url = require('url');
var mathHelper = require('./../../helpers/math');
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
            ['/test3/', {b: 'b', c: {ca: 'c'}}]
        ];
        given.async(data).it('must correct generate URL, call GET API, parse JSON and call callback', function (done, path, params) {
            api.get(path, params, function (error, data) {
                var resultUrl = url.parse(data.url);
                resultUrl.pathname.should.be.equal(path);

                var resultParams = extend({}, qs.parse(resultUrl.query));
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

    describe('.get error', function () {

        before(function (done) {
            sinon.stub(request, 'get', function (url, callback) {
                var error = new Error('test error');
                var response = {
                    statusCode: 200,
                    href: url
                };
                var body = JSON.stringify({url: url});

                callback(error, response, body);
            });
            done();
        });

        it('must catch error and call callback with error parameter', function (done) {
            api.get('/test/', {}, function (error, data) {
                error.should.Error;
                done();
            });
        });

        after(function (done) {
            request.get.restore();
            done();
        });

    });

    describe('.get non 200 (from 201 till 500)', function () {

        before(function (done) {
            sinon.stub(request, 'get', function (url, callback) {
                var error = new Error('test error');
                var response = {
                    statusCode: 200 + mathHelper.random(1, 300),
                    href: url
                };
                var body = JSON.stringify({url: url});

                callback(error, response, body);
            });
            done();
        });

        it('must catch error when wrong answer status code and call callback with error parameter', function (done) {
            api.get('/test/', {}, function (error, data) {
                error.should.Error;
                done();
            });
        });

        after(function (done) {
            request.get.restore();
            done();
        });

    });

    describe('.get protected action', function () {});
    describe('.get protected action error in the first request', function () {});
    describe('.get protected action non 200', function () {});
    describe('.get protected action empty token', function () {});

});

