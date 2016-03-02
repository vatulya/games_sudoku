'use strict';

class BotStrategySimple {

    constructor (boardState) {
        this.boardState = boardState;
        this.cellsWithMarks = {};
        this.numbersWithMarks = [];
    }

    calculateAction () {
        return new Promise((fulfill, reject) => {
            let result,
                difficulty,
                actionName = BotStrategySimple.ACTION_SET_CELL_NUMBER,
                parameters;

            result = this.findAloneCell(5);

            if (!result) {
                result = this.findAloneMarkNumberPerGroup(3);
            }

            if (!result) {
                result = this.setMarks(3);
                actionName = BotStrategySimple.ACTION_SET_CELL_MARK;
            }

            if (result) {
                parameters = {
                    coords: result.cell.coords.toString(),
                    number: result.number
                };
                difficulty = result.difficulty;
            }

            fulfill({actionName: actionName, parameters: parameters, difficulty: difficulty});
        });
    }

    /*** *********************** ***/

    findAloneCell (difficulty) {
        let result = this.findAloneCellInGroups(this.boardState.rows);

        if (!result) {
            result = this.findAloneCellInGroups(this.boardState.cols);
        }

        if (!result) {
            result = this.findAloneCellInGroups(this.boardState.squares);
        }

        if (result) {
            result.difficulty = difficulty;
        }

        return result;
    }

    findAloneCellInGroups (groups) {
        let result = null;

        groups.every((group) => {
            result = this.findAloneCellInGroup(group);
            return !result;
        });

        return result;
    }

    findAloneCellInGroup (group) {
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

    /*** *********************** ***/

    findAloneMarkNumberPerGroup (difficulty) {
        let result = null;

        this.numbersWithMarks.every((number) => {

            result = this.findAloneMarkNumberPerGroupInGroups(this.boardState.rows, number);

            if (!result) {
                result = this.findAloneMarkNumberPerGroupInGroups(this.boardState.cols, number);
            }

            if (!result) {
                result = this.findAloneMarkNumberPerGroupInGroups(this.boardState.squares, number);
            }

            if (result) {
                result.difficulty = difficulty;
                return false;
            }

            return true;
        });

        return result;
    }

    findAloneMarkNumberPerGroupInGroups (groups, number) {
        let result = null;

        groups.every((group) => {
            result = this.findAloneMarkNumberPerGroupInGroup(group, number);
            return !result;
        });

        return result;
    }

    findAloneMarkNumberPerGroupInGroup (group, number) {
        let result = null,
            emptyCell,
            countFound = 0;

        Object.keys(group.cells).every((i) => {
            let cell = group.cells[i];
            if (!cell.isOpen && cell.hasMark(number)) {
                countFound++;
                emptyCell = cell;
            }
            return (countFound <= 1);
        });

        if (countFound === 1 && emptyCell) {
            // Great! only one cell with mark of the number
            result = {
                cell: emptyCell,
                number: number
            };
        }

        return result;
    }

    /*** *********************** ***/

    setMarks (difficulty) {
        let result = null,
            allNumbers = Array.apply(null, new Array(this.boardState.size)).map((_, i) => { return i + 1; });

        allNumbers.every((number) => {
            if (this.numbersWithMarks.indexOf(number) === -1) {
                result = this.setMarkForNumber(number);
                if (!result) {
                    // this number already has all marks on the board
                    this.numbersWithMarks.push(number);
                    return true;
                }

                return false;
            }
            return true;
        });

        if (result) {
            result.difficulty = difficulty;
        }

        return result;
    }

    setMarkForNumber (number) {
        let result = null;

        Object.keys(this.boardState.cells).every((key) => {
            let cell = this.boardState.cells[key],
                coordsString = cell.coords.toString(),
                row = this.boardState.rows[cell.coords.row],
                col = this.boardState.cols[cell.coords.col],
                square = this.boardState.squares[cell.squareNumber];

            if (!this.cellsWithMarks.hasOwnProperty(coordsString)) {
                this.cellsWithMarks[coordsString] = [];
            }

            if (cell.isOpen) {
                return true;
            }

            if (this.cellsWithMarks[coordsString].indexOf(number) !== -1) {
                return true; // this cell for this number already checked
            }

            if (cell.number || cell.hasMark(number)) {
                // this cell already with number or with this mark
                this.cellsWithMarks[coordsString].push(number);
                return true;
            }

            if (this.isNumberInGroup(row, number) || this.isNumberInGroup(col, number) || this.isNumberInGroup(square, number)) {
                this.cellsWithMarks[coordsString].push(number);
                return true;
            }

            // Great. If we are here then we can add mark here
            result = {
                cell: cell,
                number: number
            };

            this.cellsWithMarks[coordsString].push(number);
            return false;
        });

        return result;
    }

    isNumberInGroup (group, number) {
        let found = false;

        number = parseInt(number) || 0;

        Object.keys(group.cells).every((i) => {
            if (group.cells[i].number === number) {
                found = true;
                return false;
            }
            return true;
        });

        return found;
    }

    /*** *********************** ***/

}

BotStrategySimple.ACTION_SET_CELL_NUMBER = 'SetCellNumber';
BotStrategySimple.ACTION_SET_CELL_MARK = 'SetCellMark';
BotStrategySimple.ACTION_UNDO = 'Undo';

module.exports = BotStrategySimple;
