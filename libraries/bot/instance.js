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
            .then((strategyAction) => {
                let timeout = this.calculateTimeout(strategyAction.difficulty);

                this.actionTimeout = setTimeout(() => {
                    this.emit('beforeAction');

                    let methodName;

                    if (this.acitonsCount++ > 10) {
                        this.stop();
                        return;
                    }

                    methodName = 'strategy' + strategyAction.name;

                    this[methodName].apply(this, strategyAction.getParametersAsArray())
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

    strategySetCellNumber (coords, number) {
        let data = {
            checkedCells: {},
            markedCells: {}
        };
        data.checkedCells[coords] = number;

        return this.sudoku.setCells(data);
    }

    strategySetCellMark (coords, mark) {
        let data = {
                checkedCells: {},
                markedCells: {}
            },
            cell = this.sudoku.getCellByCoords(coords),
            marks = cell.marks;

        marks.push(mark);
        data.markedCells[coords] = marks;

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

