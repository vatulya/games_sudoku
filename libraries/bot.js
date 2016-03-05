'use strict';

let extend = require('util')._extend,

    Promise = require('promise'),

    BotInstance = require('./bot/instance');

let botInstances = [];

class Bot {

    static exists (sudoku) {
        return !!(botInstances[sudoku.getHash()]);
    }

    static create (sudoku) {
        let botInstance = new BotInstance(sudoku);

        botInstances[sudoku.getHash()] = botInstance;

        return botInstance;
    }

    static start (sudoku) {
        return botInstances[sudoku.getHash()].start();
    }

    static stop (sudoku) {
        return botInstances[sudoku.getHash()].stop();
    }

}

module.exports = Bot;
