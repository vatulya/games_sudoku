var given = require('mocha-testdata');
var should = require('should');

var mathHelper = require('./../../helpers/math');

describe('helpers/math', function () {

    describe('.random', function () {

        var data = [
            [0, 1],
            [0, 10],
            [10, 100],
            [5, 5],
            [4, 1],
            [-1, 1],
            [0, 0],
            [-10, -11],
            [-10, -5],
            ['', 'a']
        ];
        given(data).it('must generate random number in given range', function (min, max) {
            var result = mathHelper.random(min, max);
            min = parseInt(min);
            max = parseInt(max);
            if (isNaN(min) || isNaN(max)) {
                should(result).be.Error;
            } else if (max < min) {
                should(result).be.Error;
            } else {
                should(result).be.within(min, max);
            }
        })

    });

});