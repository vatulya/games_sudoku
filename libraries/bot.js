'use strict';

let Promise = require('promise');

class Bot {

    constructor (sudokuBoardState, actionCallback) {
        this.iterationInterval = null;
        this.iterationsCount = 0;
        this.sudokuBoardState = sudokuBoardState;
        this.actionCallback = actionCallback;
    }

    start () {
        console.log('BOT START');

        this.iterationInterval = setInterval(this.iteration.bind(this), 1000);
    }

    iteration () {
        let allKeys = Object.keys(this.sudokuBoardState.cells),
            targetCell,
            newNumber;

        allKeys.every((key) => {
            let cell = this.sudokuBoardState.cells[key];
            if (!cell.isOpen) {
                targetCell = cell;
                return false;
            }
            return true;
        });

        newNumber = targetCell.number ? 0 : 5;

        this.actionCallback(targetCell.coords.toString(), newNumber);

        if (this.iterationsCount++ > 10) {
            this.stop();
        }
    }

    stop () {
        clearInterval(this.iterationInterval);
        this.iterationsCount = 0;
        console.log('BOT STOP');
    }

}

module.exports = Bot;
