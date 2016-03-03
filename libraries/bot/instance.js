'use strict';

let EventEmitter = require('events'),

    BotStrategySimple = require('./strategy/simple'),
    CellCoords = require('./../sudoku/cell/coords');

class BotInstance extends EventEmitter {

    constructor (sudoku) {
        super();

        this.sudoku = sudoku;

        this.actionTimeout = null;

        this.strategy = new BotStrategySimple(this.sudoku.board.state);
    }

    start () {
        this.emit('start');

        this.loop();
    }

    loop () {
        let loopStop = this.stop.bind(this);

        this.strategy.calculateAction()
            .then((result) => {
                if (typeof result !== 'object'
                    || !result.hasOwnProperty('actionName')
                    || !result.hasOwnProperty('parameters')
                    || typeof result.parameters !== 'object'
                    || !result.hasOwnProperty('difficulty')
                ) {
                    throw new Error('Bot error. Wrong calculated action: ' + JSON.stringify(result));
                }

                if (!result.parameters.hasOwnProperty('whileCallback')) {
                    result.parameters.whileCallback = () => { return false; }; // do action once
                }

                let timeout = this.calculateTimeout(result.difficulty),
                    recurse = () => {
                        this.doStrategyAction(result.actionName, result.parameters, timeout)
                            .then(() => {
                                if (result.parameters.whileCallback()) {
                                    recurse();
                                } else {
                                    this.loop(); // run loop again
                                }
                            })
                            .catch(loopStop);
                    };

                recurse();
            })
            .catch(loopStop);
    }

    stop (error) {
        if (error) {
            console.log(error);
        }

        clearTimeout(this.actionTimeout);

        this.emit('stop');
    }

    doStrategyAction (actionName, parameters, timeout) {
        return new Promise((fulfill, reject) => {
            this.actionTimeout = setTimeout(() => {
                this.emit('beforeAction');

                let methodName = 'strategy' + actionName;

                this[methodName](parameters)
                    .then(() => {
                        this.emit('afterAction');
                        return fulfill();
                    })
                    .catch(reject);
            }, timeout);
        });
    }

    strategySetCellNumber (parameters) {
        if (!parameters.hasOwnProperty('coords') || !parameters.hasOwnProperty('number')) {
            throw new Error('strategy SetCellNumber error. Wrong parameters. Parameters: ' + JSON.stringify(parameters));
        }

        let data = {
                checkedCells: {},
                markedCells: {}
            },
            coords = new CellCoords(parameters.coords),
            newState = this.sudoku.board.state.copy(),
            diff,
            newCell;

        data.checkedCells[parameters.coords] = parameters.number;

        newCell = newState.getCellByCoords(coords);
        newState.removeColRowSquareMarks(newCell, parameters.number);
        newCell.removeAllMarks();
        diff = this.sudoku.board.state.diff(newState);

        if (Object.keys(diff.markedCells).length) {
            data.markedCells = diff.markedCells;
        }

        return this.sudoku.setCells(data);
    }

    strategySetCellMark (parameters) {
        if (!parameters.hasOwnProperty('coords') || !parameters.hasOwnProperty('number')) {
            throw new Error('strategy SetCellMark error. Wrong parameters. Parameters: ' + JSON.stringify(parameters));
        }

        let data = {
                checkedCells: {},
                markedCells: {}
            },
            cell = this.sudoku.getCellByCoords(parameters.coords),
            marks = cell.marks.slice();

        marks.push(parameters.number);
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

