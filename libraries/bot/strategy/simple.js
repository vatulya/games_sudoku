'use strict';

class BotStrategySimple {

    constructor (boardState) {
        this.boardState = boardState;
    }

    calculateAction () {
        return new Promise((fulfill, reject) => {
            let result,
                difficulty,
                actionName = BotStrategySimple.ACTION_SET_CELL_NUMBER,
                parameters;

            result = this.checkAloneCells();

            if (result) {
                parameters = {
                    coords: result.cell.coords,
                    number: result.number
                };
                difficulty = 5;
            }

            fulfill({actionName: actionName, parameters: parameters, difficulty: difficulty});
        });
    }

    checkAloneCells () {
        let result = this.checkAloneCellInGroups(this.boardState.rows);

        if (!result) {
            result = this.checkAloneCellInGroups(this.boardState.cols);
        }

        if (!result) {
            result = this.checkAloneCellInGroups(this.boardState.squares);
        }

        return result;
    }

    checkAloneCellInGroups (groups) {
        let result = null,
            found = false;

        groups.every((group) => {
            result = this.checkAloneCellInGroup(group);
            if (result) {
                found = true;
            }

            return !found;
        });

        return result;
    }

    checkAloneCellInGroup (group) {
        let absentNumbers = Array.apply(null, new Array(this.boardState.size)).map((_, i) => { return i + 1; }),
            result = null,
            emptyCell;

        Object.keys(group.cells).forEach((i) => {
            let cell = group.cells[i];
            if (cell.number) {
                absentNumbers.splice(absentNumbers.indexOf(cell.number), 1);
            } else {
                emptyCell = cell;
            }
        });

        if (absentNumbers.length === 1 && emptyCell) {
            // Great! only one number absent in current square
            result = {
                cell: emptyCell,
                number: absentNumbers[0]
            };
        }

        return result;
    }

}

BotStrategySimple.ACTION_SET_CELL_NUMBER = 'SetCellNumber';
BotStrategySimple.ACTION_SET_CELL_MARK = 'SetCellMark';
BotStrategySimple.ACTION_UNDO = 'Undo';

module.exports = BotStrategySimple;
