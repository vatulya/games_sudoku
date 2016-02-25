'use strict';

let EventEmitter = require('events'),

    Promise = require('promise'),

    BotStrategySimple = require('./strategy/simple');

class BotInstance extends EventEmitter {

    constructor (sudoku) {
        super();

        this.sudoku = sudoku;

        this.actionTimeout = null;
        this.acitonsCount = 0;

        this.strategy = new BotStrategySimple(this.sudoku.board.state);
    }

    start () {
        this.emit('start');

        this.acitonsCount = 0;

        this.loop();
    }

    loop () {
        this.strategy.calculateAction()
            .then((result) => {
                if (!result.hasOwnProperty('actionName') || !result.hasOwnProperty('parameters') || !result.hasOwnProperty('difficulty')) {
                    throw new Error('Bot error. Wrong calculated action: ' + JSON.stringify(result));
                }

                let timeout = this.calculateTimeout(result.difficulty);

                this.actionTimeout = setTimeout(() => {
                    this.emit('beforeAction');

                    if (this.acitonsCount++ > 10) {
                        this.stop();
                        return;
                    }

                    let methodName = 'strategy' + result.actionName;

                    this[methodName](result.parameters)
                        .then(() => {
                            this.emit('afterAction');

                            this.loop(); // run loop again
                        })
                        .catch((error) => {
                            this.stop(error);
                        });
                }, timeout);
            })
            .catch((error) => {
                this.stop(error);
            });
    }

    stop (error) {
        if (error) {
            console.log(error);
        }

        clearTimeout(this.actionTimeout);

        this.emit('stop');
    }

    strategySetCellNumber (parameters) {
        if (!parameters.hasOwnProperty('coords') || !parameters.hasOwnProperty('number')) {
            throw new Error('strategy SetCellNumber error. Wrong parameters. Parameters: ' + JSON.stringify(parameters));
        }

        let data = {
            checkedCells: {},
            markedCells: {}
        };
        data.checkedCells[parameters.coords] = parameters.number;

        return this.sudoku.setCells(data);
    }

    strategySetCellMark (parameters) {
        if (!parameters.hasOwnProperty('coords') || !parameters.hasOwnProperty('mark')) {
            throw new Error('strategy SetCellNumber error. Wrong parameters. Parameters: ' + JSON.stringify(parameters));
        }

        let data = {
                checkedCells: {},
                markedCells: {}
            },
            cell = this.sudoku.getCellByCoords(parameters.coords),
            marks = cell.marks; // TODO: check if marks array is not reference

        marks.push(parameters.mark);
        data.markedCells[parameters.coords] = marks;

        return this.sudoku.setCells(data);
    }

    strategyUndo () {
        return this.sudoku.undoMove();
    }

    calculateTimeout (actionDifficulty) {
        return (actionDifficulty * 100) + 500; // 500ms --- 1500ms
    }

}

module.exports = BotInstance;

