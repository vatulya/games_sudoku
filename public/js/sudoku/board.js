'use strict';

class SudokuBoard {

    constructor (container) {
        this.container = $(container); // jQuery object of main board container. .sudoku-table
        this.board = this.container.find('.sudoku-board');
        this.size = 0;

        this.cells = {};
        this.rows = [];
        this.cols = [];
        this.squares = [];

        this.selectedCell = null;

        this.init();
    }

    /********************************************** INIT ***/

    init () {
        window.disableSelect(this.board);

        this.initCells();
        this.initEvents();
    }

    initCells () {
        let cellsPerRow = [],
            cellsPerCol = [],
            cellsPerSquare = [],

            allCells,
            size;

        // Initialize cells
        this.cells = {};
        allCells = this.container.find('.cell');
        size = parseInt(Math.sqrt(allCells.length)) || 0;
        allCells.each((i, el) => {
            let cell = new SudokuCell(el, size),
                row = cell.coords.row,
                col = cell.coords.col,
                square = cell.squareNumber;

            this.cells[cell.coords.toString()] = cell;

            // Fill rows array
            if (!cellsPerRow[row]) {
                cellsPerRow[row] = [];
            }
            cellsPerRow[row][col] = cell;

            // Fill cols array
            if (!cellsPerCol[col]) {
                cellsPerCol[col] = [];
            }
            cellsPerCol[col][row] = cell;

            // Fill squares array
            if (!cellsPerSquare[square]) {
                cellsPerSquare[square] = [];
            }
            cellsPerSquare[square].push(cell);

            if (square % 2) {
                cell.container.addClass('gray');
            }
        });

        // Initialize rows
        this.rows = [];
        $.each(cellsPerRow, (row, cells) => {
            this.rows[row] = new SudokuCellRow(cells);
        });

        // Initialize cols
        this.cols = [];
        $.each(cellsPerCol, (col, cells) => {
            this.cols[col] = new SudokuCellCol(cells);
        });

        // Initialize squares
        this.squares = [];
        $.each(cellsPerSquare, (square, cells) => {
            this.squares[square] = new SudokuCellSquare(cells);
        });

        // Calculate board size
        this.size = this.cols.length - 1;

        if (this.size != size) {
            throw new Error('Wrong board size. Board size "' + allCells.length + '", but cells per line "' + this.size + '"');
        }
    }

    initEvents () {
        this.board
            .on('mouseover', '.cell', (e) => {
                let cell = this.findCell(e.currentTarget);
                // hover vertical col and horizontal row
                this.hoverColAndRow(cell);
            })
            .on('mouseout', () => {
                // unhover vertical col and horizontal row
                this.hoverColAndRow();
            })
            .on('click', '.cell', () => {
                // look mousedown/mouseup
            })
            .on('mousedown', '.cell', (e) => {
                let cell = this.findCell(e.currentTarget);
                this.selectCell(cell);
                this.hoverNumber(cell.getNumber());
            })
        ;
    }

    /********************************************** /INIT ***/

    /********************************************** PROTECTED METHODS ***/


    /********************************************** /PROTECTED METHODS ***/

    /********************************************** PUBLIC METHODS ***/

    getHash () {
        let boardString = '',
            cell;

        for (var key in this.cells) {
            if (this.cells.hasOwnProperty(key)) {
                cell = this.cells[key];
                boardString += '' + cell.getNumber() + '_';
            }
        }

        return $.md5(boardString);
    }

    findCell (el) {
        let coords = new SudokuCellCoords(el),
            cell = this.cells[coords.toString()] || null;

        if (!cell) {
            throw new Error('Can\'t find cell by "' + el + '" and coords "' + coords.toString() + '"');
        }

        return cell;
    }

    fill (board) {
        $.each(board.openedCells || {}, (coords, number) => {
            let cell = this.findCell(coords);
            cell.setNumber(number);
            cell.container.removeClass('open marks').addClass('locked');
        });
        this.applyState(board);
    }

    show () {
        this.board.removeClass('hide-game');
    }

    hide () {
        this.board.addClass('hide-game');
    }

    /**
     * Apply checkedCells and markedCells
     * Can be used for apply History state or other group operations
     *
     * @param boardState
     */
    applyState (boardState) {
        var keys = [],
            number,
            marks;

        keys.push(...Object.keys(boardState.checkedCells),...Object.keys(boardState.markedCells));

        this.clear();

        $.each(keys, (i, coords) => {
            number = boardState.checkedCells.hasOwnProperty(coords) ? boardState.checkedCells[coords] : undefined;
            marks = boardState.markedCells.hasOwnProperty(coords) ? boardState.markedCells[coords] : undefined;
            this.setCell(coords, number, marks);
        });
    }

    getState () {
        let state = {
            openedCells: {},
            checkedCells: {},
            markedCells: {}
        };

        $.each(this.cells, function (i, cell) {
            let coords = cell.coords.toString();

            if (!cell.isOpen()) {
                state.openedCells[coords] = cell.getNumber();
            } else {
                if (cell.getNumber() > 0) {
                    state.checkedCells[coords] = cell.getNumber();
                }
                state.markedCells[coords] = cell.getMarks();
            }
        });

        return state;
    }

    selectCell (cell) {
        if (this.selectedCell) {
            //this.board.find('.cell.selected').removeClass('selected');
            this.selectedCell.container.removeClass('selected');
            this.selectedCell = null;
        }

        if (cell) {
            this.selectedCell = this.findCell(cell);
            this.selectedCell.container.addClass('selected');
        }
    }

    setCell (cell, number, marks) {
        if (typeof number !== 'undefined') {
            if (this.setCellNumber(cell, number)) {
                this.removeColRowMarks(cell, number);
            }
        }
        if (typeof marks !== 'undefined') {
            this.setCellMarks(cell, marks);
        }
    }

    setCellNumber (cell, number) {
        cell = this.findCell(cell);
        if (cell.isOpen()) {
            cell.setNumber(number);
            cell.getNumber() ? cell.hideMarks() : cell.showMarks();
        }
    }

    addCellMark (cell, mark) {
        cell = this.findCell(cell);
        if (cell.isOpen()) {
            cell.addMark(mark);
            if (cell.isEmpty()) {
                cell.showMarks();
            }
        }
    }

    removeCellMark (cell, mark) {
        cell = this.findCell(cell);
        if (cell.isOpen()) {
            cell.removeMark(mark);
            if (cell.isEmpty()) {
                cell.showMarks();
            }
        }
    }

    setCellMarks (cell, marks) {
        cell = this.findCell(cell);
        if (cell.isOpen()) {
            cell.setMarks(marks);
            if (cell.isEmpty()) {
                cell.showMarks();
            }
        }
    }

    removeColRowMarks (cell, mark) {
        cell = this.findCell(cell);
        this.rows[cell.coords.getRow()].each((i, cellRow) => {
            cellRow.removeMark(mark);
        });
        this.cols[cell.coords.getCol()].each((i, cellCol) => {
            cellCol.removeMark(mark);
        });
    }

    clear () {
        $.each(this.cells, (i, cell) => {
            if (cell.isOpen()) {
                this.setCell(cell, 0, []);
            }
        });
    }

    hoverColAndRow (cell) { // TURNED OFF
        this.board.find('.cell.hover').removeClass('hover');
        if (cell) {
            cell = this.findCell(cell);
            this.board.find('.cell.' + cell.coords.getRowCssClass() + ', .cell.' + cell.coords.getColCssClass()).addClass('hover'); // Hover row and col
            cell.container.removeClass('hover'); // But don't hover focus cell
        }
    }

    hoverNumber (number) {
        this.board.find('.cell.hovered').removeClass('hovered');
        number = parseInt(number) || 0;
        if (number > 0) {
            $.each(this.cells, (i, cell) => {
                if (cell.getNumber() == number) {
                    cell.container.addClass('hovered');
                }
            });
        }
    }

    showErrors (errors) {
        if (!errors) {
            this.board.addClass('no-errors');
        } else {
            $.each(errors, (i, coords) => {
                let cell = this.findCell(coords);
                if (cell) {
                    cell.container.addClass('error');
                }
            });
        }

        setTimeout(() => {
            this.board.removeClass('no-errors');
            this.board.find('.cell.error').removeClass('error');
        }, 2000);
    }

    isFilled () {
        return !(this.board.find('.cell.empty').length > 0);
    }

    setResolved () {
        this.container.addClass('resolved');
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** STATIC METHODS ***/

    static getDiff (oldState, newState) {
        let diff = {
                checkedCells: {},
                markedCells: {}
            },
            keys;

        // checkedCells
        keys = [];
        keys.push(...Object.keys(oldState.checkedCells),...Object.keys(newState.checkedCells));
        keys = $.unique(keys);
        keys.forEach((key) => {
            let oldNumber = parseInt(oldState.checkedCells[key]) || 0,
                newNumber = parseInt(newState.checkedCells[key]) || 0;

            if (oldNumber != newNumber) {
                diff.checkedCells[key] = newNumber;
            }
        });

        // markedCells
        keys = [];
        keys.push(...Object.keys(oldState.markedCells),...Object.keys(newState.markedCells));
        keys = $.unique(keys);
        keys.forEach((key) => {
            if (JSON.stringify(oldState.markedCells[key]) != JSON.stringify(newState.markedCells[key])) {
                diff.markedCells[key] = newState.markedCells[key];
            }
        });

        return diff;
    }

    /********************************************** /STATIC METHODS ***/


}

