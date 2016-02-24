'use strict';

class BotStrategyAction {

    constructor (actionName, parameters, difficulty) {
        if (!BotStrategyAction.isAllowedActionName(actionName)) {
            throw new Error('Bot action error. Wrong name: "' + actionName + '".');
        }
        difficulty = parseInt(difficulty);

        if (difficulty < 0 || difficulty > 10) {
            throw new Error('Bot action error. Wrong difficulty: "' + difficulty + '".');
        }

        this.name = actionName;
        this.parameters = parameters || {};
        this.difficulty = parseInt(difficulty);
    }

    getParametersAsArray () {
        let keys = Object.keys(this.parameters),
            array = [];

        keys.forEach((key) => {
            array.push(this.parameters[key]);
        });

        return array;
    }

    static isAllowedActionName (name) {
        return [
                BotStrategyAction.ACTION_SET_CELL_NUMBER,
                BotStrategyAction.ACTION_SET_CELL_MARK,
                BotStrategyAction.ACTION_UNDO
            ].indexOf(name) !== -1;
    }

}

BotStrategyAction.ACTION_SET_CELL_NUMBER = 'SetCellNumber';
BotStrategyAction.ACTION_SET_CELL_MARK = 'SetCellMark';
BotStrategyAction.ACTION_UNDO = 'Undo';

module.exports = BotStrategyAction;
