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
        size = parseInt(Math.sqrt(allCells.length));
        allCells.each((i, el) => {
            let Cell = new SudokuCell(el, size),
                row = Cell.coords.row,
                col = Cell.coords.col,
                square = Cell.squareNumber;

            this.cells[Cell.coords.toString()] = Cell;

            // Fill rows array
            if (!cellsPerRow[row]) {
                cellsPerRow[row] = [];
            }
            cellsPerRow[row][col] = Cell;

            // Fill cols array
            if (!cellsPerCol[col]) {
                cellsPerCol[col] = [];
            }
            cellsPerCol[col][row] = Cell;

            // Fill squares array
            if (!cellsPerSquare[square]) {
                cellsPerSquare[square] = [];
            }
            cellsPerSquare[square].push(Cell);

            if (square % 2) {
                Cell.container.addClass('gray');
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
                let Cell = this.findCell(e.currentTarget);
                // hover vertical col and horizontal row
                this.hoverColAndRow(Cell);
            })
            .on('mouseout', () => {
                // unhover vertical col and horizontal row
                this.hoverColAndRow();
            })
            .on('click', '.cell', () => {
                // look mousedown/mouseup
            })
            .on('mousedown', '.cell', (e) => {
                let Cell = this.findCell(e.currentTarget);
                this.selectCell(Cell);
                //Cell.container.addClass('pushed'); // TODO: move into numpad
                this.hoverNumber(Cell.getNumber());
            })
        ;
    }

    /********************************************** /INIT ***/

    /********************************************** PROTECTED METHODS ***/


    /********************************************** /PROTECTED METHODS ***/

    /********************************************** PUBLIC METHODS ***/

    getHash () {
        let boardString = '',
            Cell;

        for (var key in this.cells) {
            if (this.cells.hasOwnProperty(key)) {
                Cell = this.cells[key];
                boardString += '' + Cell.getNumber() + '_';
            }
        }

        return $.md5(boardString);
    }

    findCell (el) {
        let Coords = new SudokuCellCoords(el),
            Cell = this.cells[Coords.toString()] || null;

        if (!Cell) {
            throw new Error('Can\'t find cell by "' + el + '" and coords "' + Coords.toString() + '"');
        }

        return Cell;
    }

    fill (board) {
        let self = this;

        $.each(board.openedCells || {}, function(coords, number) {
            let Cell = self.findCell(coords);
            Cell.setNumber(number);
            Cell.container.removeClass('open marks').addClass('locked');
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
        let self = this;

        $.each(boardState.checkedCells || {}, function(coords, number) {
            let Cell = self.findCell(coords);
            Cell.setNumber(number);
        });
        $.each(boardState.markedCells || {}, function(coords, marks) {
            let Cell = self.findCell(coords);
            Cell.setMarks(marks);
            if (Cell.getMarks() && !Cell.getNumber()) {
                Cell.container.addClass('marks');
            }
        });
    }

    getState () {
        let state = {
            openedCells: {},
            checkedCells: {},
            markedCells: {}
        };

        $.each(this.cells, function (i, Cell) {
            let coords = Cell.coords.toString();

            if (!Cell.isOpen()) {
                state.openedCells[coords] = Cell.getNumber();
            } else {
                if (Cell.getNumber() > 0) {
                    state.checkedCells[coords] = Cell.getNumber();
                }
                state.markedCells[coords] = Cell.getMarks();
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
        if (typeof number != 'undefined') {
            if (this.setCellNumber(cell, number)) {
                this.removeColRowMarks(cell, number);
            }
        }
        if (typeof marks != 'undefined') {
            this.setCellMarks(cell, marks);
        }
    }

    setCellNumber (cell, number) {
        let Cell = this.findCell(cell);
        if (Cell.isOpen()) {
            Cell.setNumber(number);
            Cell.getNumber() ? Cell.hideMarks() : Cell.showMarks();
        }
    }

    addCellMark (cell, mark) {
        let Cell = this.findCell(cell);
        if (Cell.isOpen()) {
            Cell.addMark(mark);
            if (Cell.isEmpty()) {
                Cell.showMarks();
            }
        }
    }

    setCellMarks (cell, marks) {
        let Cell = this.findCell(cell);
        if (Cell.isOpen()) {
            Cell.setMarks(marks);
            if (Cell.isEmpty()) {
                Cell.showMarks();
            }
        }
    }

    removeColRowMarks (cell, mark) {
        let Cell = this.findCell(cell);
        this.rows[Cell.coords.getRow()].each((i, CellRow) => {
            CellRow.removeMark(mark);
        });
        this.cols[Cell.coords.getCol()].each((i, CellCol) => {
            CellCol.removeMark(mark);
        });
    }

    clear () {
        $.each(this.cells, (i, Cell) => {
            if (Cell.isOpen()) {
                self.setCell(Cell, 0, []);
            }
        });
    }

    hoverColAndRow (Cell) { // TURNED OFF
        this.board.find('.cell.hover').removeClass('hover');
        if (Cell) {
            Cell = this.findCell(Cell);
            this.board.find('.cell.' + Cell.coords.getRowCssClass() + ', .cell.' + Cell.coords.getColCssClass()).addClass('hover'); // Hover row and col
            Cell.container.removeClass('hover'); // But don't hover focus cell
        }
    }

    hoverNumber (number) {
        this.board.find('.cell.hovered').removeClass('hovered');
        number = parseInt(number);
        if (number > 0) {
            $.each(this.cells, (i, Cell) => {
                if (Cell.getNumber() == number) {
                    Cell.container.addClass('hovered');
                }
            });
        }
    }

    showErrors (errors) {
        if (!errors) {
            this.board.addClass('no-errors');
        } else {
            $.each(errors, (i, coords) => {
                let Cell = this.findCell(coords);
                if (Cell) {
                    Cell.container.addClass('error');
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
            keys = [];

        // checkedCells
        keys = [];
        keys.push(...Object.keys(oldState.checkedCells),...Object.keys(newState.checkedCells));
        keys = $.unique(keys);
        keys.forEach((key) => {
            if (parseInt(oldState.checkedCells[key]) != parseInt(newState.checkedCells[key])) {
                diff.checkedCells[key] = parseInt(newState.checkedCells[key]);
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

