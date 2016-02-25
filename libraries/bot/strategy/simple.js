'use strict';

let Promise = require('promise');

class BotStrategySimple {

    constructor (boardState) {
        this.boardState = boardState;
    }

    calculateAction () {
        return new Promise((fulfill, reject) => {
            let coords,

                allCellsKeys = Object.keys(this.boardState.cells),
                cell,

                actionName = BotStrategySimple.ACTION_SET_CELL_NUMBER,
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

            fulfill({actionName: actionName, parameters: parameters, difficulty: difficulty});
        });
    }

}

BotStrategySimple.ACTION_SET_CELL_NUMBER = 'SetCellNumber';
BotStrategySimple.ACTION_SET_CELL_MARK = 'SetCellMark';
BotStrategySimple.ACTION_UNDO = 'Undo';

module.exports = BotStrategySimple;
