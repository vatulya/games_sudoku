'use strict';

let Promise = require('promise'),

    BotStrategyAction = require('./aciton');

class BotStrategySimple {

    constructor (boardState) {
        this.boardState = boardState;
    }

    calculateAction () {
        return new Promise((fulfill, reject) => {
            let coords,
                number = 5,

                allCellsKeys = Object.keys(this.boardState.cells),
                cell,

                actionName = BotStrategyAction.ACTION_SET_CELL_NUMBER,
                parameters,
                difficulty = 5;

            allCellsKeys.every((key) => {
                cell = this.boardState.cells[key];
                if (!cell.isOpen) {
                    coords = key;
                    return false;
                }
                return true;
            });

            parameters = {coords: coords, number: cell.number ? 0 : 5};

            fulfill(new BotStrategyAction(actionName, parameters, difficulty));
        });
    }

}

module.exports = BotStrategySimple;
