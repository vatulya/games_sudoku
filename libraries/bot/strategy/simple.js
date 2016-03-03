'use strict';

class BotStrategySimple {

    constructor (boardState) {
        this.boardState = boardState;
        this.cellsWithMarks = {};
        this.numbersWithMarks = [];
        this.guessCells = [];
    }

    calculateAction () {
        return new Promise((fulfill, reject) => {
            let result,
                parameters;

            result = this.checkErrors(5);

            if (!result) {
                result = this.findAloneCell(5);
            }

            if (!result) {
                result = this.findAloneMark(3);
            }

            if (!result) {
                result = this.findAloneMarkNumberPerGroup(3);
            }

            if (!result) {
                result = this.setMarks(0); //3
            }

            if (!result) {
                result = this.guessCell(5);
            }

            if (result) {
                switch (result.actionName) {
                    case BotStrategySimple.ACTION_SET_CELL_NUMBER:
                    case BotStrategySimple.ACTION_SET_CELL_MARK:
                        parameters = {
                            coords: result.cell.coords.toString(),
                            number: result.number
                        };
                        break;

                    case BotStrategySimple.ACTION_UNDO:
                        parameters = {
                            whileCallback: result.whileCallback || null
                        };
                        break;

                    default:
                        // error
                        break;
                }

                return fulfill({actionName: result.actionName, parameters: parameters, difficulty: result.difficulty});
            }

            return reject(new Error('Can\'t find any action'));
        });
    }

    /*** *********************** ***/

    checkErrors (difficulty) {
        let allNumbers = Array.apply(null, new Array(this.boardState.size)).map((_, i) => { return i + 1; }),
            result,
            targetCell,
            isError;

        if (this.guessCells.length) {
            isError = !Object.keys(this.boardState.notOpenedCells).every((key) => {
                let cell = this.boardState.notOpenedCells[key];

                if (cell.number) {
                    return true;
                }

                if (cell.marks.length) {
                    return cell.marks.every((mark) => {
                        return this.boardState.isAllowedNumberPosition(cell, mark);
                    });
                } else {
                    return allNumbers.some((number) => {
                        return this.boardState.isAllowedNumberPosition(cell, number);
                    });
                }
            });

            if (isError) {
                targetCell = this.guessCells.pop();
                result = {
                    whileCallback: () => {
                        let cell = this.boardState.getCellByCoords(targetCell.coords);
                        if (!cell.number) { // good. now wrong cell is empty. Let's remove wrong number mark
                            cell.removeMark(targetCell.number);
                            return false;
                        }
                        return true;
                    }
                };
            }
        }

        if (result) {
            result.difficulty = difficulty;
            result.actionName = BotStrategySimple.ACTION_UNDO;
        }

        return result;
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
            result.actionName = BotStrategySimple.ACTION_SET_CELL_NUMBER;
        }

        return result;
    }

    findAloneCellInGroups (groups) {
        let result = null;

        Object.keys(groups).every((key) => {
            result = this.findAloneCellInGroup(groups[key]);
            return !result;
        });

        return result;
    }

    findAloneCellInGroup (group) {
        let absentNumbers = Array.apply(null, new Array(this.boardState.size)).map((_, i) => { return i + 1; }),
            result = null,
            emptyCell;

        Object.keys(group.cells).forEach((key) => {
            let cell = group.cells[key];
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

    findAloneMark (difficulty) {
        let result = null;

        if (this.numbersWithMarks.length === this.boardState.size) {
            Object.keys(this.boardState.notOpenedCells).every((key) => {
                let cell = this.boardState.notOpenedCells[key];
                if (!cell.number && cell.marks.length === 1) {
                    result = {
                        cell: cell,
                        number: cell.marks[0]
                    };

                    return false;
                }

                return true;
            });
        }

        if (result) {
            result.difficulty = difficulty;
            result.actionName = BotStrategySimple.ACTION_SET_CELL_NUMBER;
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

            return !result;
        });

        if (result) {
            result.difficulty = difficulty;
            result.actionName = BotStrategySimple.ACTION_SET_CELL_NUMBER;
        }

        return result;
    }

    findAloneMarkNumberPerGroupInGroups (groups, number) {
        let result = null;

        Object.keys(groups).every((key) => {
            result = this.findAloneMarkNumberPerGroupInGroup(groups[key], number);
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
                if (result) {
                    return false;
                }

                // this number already has all marks on the board
                this.numbersWithMarks.push(number);

                return true;
            }
            return true;
        });

        if (result) {
            result.difficulty = difficulty;
            result.actionName = BotStrategySimple.ACTION_SET_CELL_MARK;
        }

        return result;
    }

    setMarkForNumber (number) {
        let result = null;

        Object.keys(this.boardState.notOpenedCells).every((key) => {
            let cell = this.boardState.notOpenedCells[key],
                coordsString = cell.coords.toString(),
                row = this.boardState.rows[cell.coords.row],
                col = this.boardState.cols[cell.coords.col],
                square = this.boardState.squares[cell.squareNumber];

            if (!this.cellsWithMarks.hasOwnProperty(coordsString)) {
                this.cellsWithMarks[coordsString] = [];
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

    guessCell (difficulty) {
        let result,
            minMarksCell;

        Object.keys(this.boardState.notOpenedCells).every((key) => {
            let cell = this.boardState.notOpenedCells[key];

            if (cell.marks.length > 0) {
                if (!minMarksCell || (minMarksCell.marks.length > cell.marks.length)) {
                    minMarksCell = cell;

                    if (minMarksCell.marks.length === 2) {
                        return false;
                    }
                }
            }

            return true;
        });

        if (minMarksCell) {
            result = {
                cell: minMarksCell,
                number: minMarksCell.marks[0]
            };

            this.guessCells.push({
                coords: minMarksCell.coords.toString(),
                number: result.number
            });
        }

        if (result) {
            result.difficulty = difficulty;
            result.actionName = BotStrategySimple.ACTION_SET_CELL_NUMBER;
        }

        return result;
    }

    /*** *********************** ***/

}

BotStrategySimple.ACTION_SET_CELL_NUMBER = 'SetCellNumber';
BotStrategySimple.ACTION_SET_CELL_MARK = 'SetCellMark';
BotStrategySimple.ACTION_UNDO = 'Undo';

module.exports = BotStrategySimple;
