'use strict';

let extend = require('util')._extend,

    Promise = require('promise'),

    BotInstance = require('./bot/instance');

let botInstances = [];

class Bot {

    static create (sudoku) {
        let botInstance = new BotInstance(sudoku);

        botInstances[sudoku.getHash()] = botInstance;

        return botInstance;
    }

}

module.exports = Bot;
