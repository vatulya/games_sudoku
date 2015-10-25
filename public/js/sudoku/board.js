function SudokuBoard(container) {
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

SudokuBoard.prototype.init = function () {
    window.disableSelect(this.board);

    this.initCells();
    this.initEvents();
};

SudokuBoard.prototype.initCells = function () {
    var self = this;

    var cellsPerRow = [];
    var cellsPerCol = [];
    var cellsPerSquare = [];

    // Initialize cells
    this.cells = {};
    var allCells = this.container.find('.cell');
    var size = parseInt(Math.sqrt(allCells.length));
    allCells.each(function (i, el) {
        var Cell = new SudokuCell(el, size);
        self.cells[Cell.coords.toString()] = Cell;

        var row = Cell.coords.row;
        var col = Cell.coords.col;

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
        var square = Cell.squareNumber;
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
    $.each(cellsPerRow, function (row, cells) {
        self.rows[row] = new SudokuCellRow(cells);
    });

    // Initialize cols
    this.cols = [];
    $.each(cellsPerCol, function (col, cells) {
        self.cols[col] = new SudokuCellCol(cells);
    });

    // Initialize squares
    this.squares = [];
    $.each(cellsPerSquare, function (square, cells) {
        self.squares[square] = new SudokuCellSquare(cells);
    });

    // Calculate board size
    this.size = this.cols.length - 1;

    if (this.size != size) {
        throw new Error('Wrong board size. Board size "' + allCells.length + '", but cells per line "' + this.size + '"');
    }
};

SudokuBoard.prototype.initEvents = function () {
    var self = this;

    this.board
        .on('mouseover', '.cell', function () {
            // hover vertical col and horizontal row
            self.hoverColAndRow($(this));
        })
        .on('mouseout', function () {
            // unhover vertical col and horizontal row
            self.hoverColAndRow();
        })
        .on('click', '.cell', function () {
            // look mousedown/mouseup
        })
        .on('mousedown', '.cell', function (e) {
            var Cell = self.findCell(e.currentTarget);
            self.selectCell(Cell);
            //Cell.container.addClass('pushed'); // TODO: move into numpad
            self.hoverNumber(Cell.getNumber());
        })
    ;
};

/********************************************** /INIT ***/

/********************************************** PROTECTED METHODS ***/


/********************************************** /PROTECTED METHODS ***/

/********************************************** PUBLIC METHODS ***/

SudokuBoard.prototype.getBoardHash = function () {
    var boardString = '';
    for (var key in this.cells) {
        if (this.cells.hasOwnProperty(key)) {
            var Cell = this.cells[key];
            boardString += '' + Cell.getNumber() + '_';
        }
    }
    return $.md5(boardString);
};

SudokuBoard.prototype.findCell = function (el) {
    var Coords = new SudokuCellCoords(el);
    var Cell = this.cells[Coords.toString()] || null;

    if (!Cell) {
        throw new Error('Can\'t find cell by "' + el + '" and coords "' + Coords.toString() + '"');
    }

    return Cell;
};

SudokuBoard.prototype.fillBoard = function (board) {
    var self = this;
    $.each(board.openedCells || {}, function(coords, number) {
        var Cell = self.findCell(coords);
        Cell.setNumber(number);
        Cell.container.removeClass('open marks').addClass('locked');
    });
    $.each(board.checkedCells || {}, function(coords, number) {
        var Cell = self.findCell(coords);
        Cell.setNumber(number);
    });
    $.each(board.markedCells || {}, function(coords, marks) {
        var Cell = self.findCell(coords);
        Cell.setMarks(marks);
        if (Cell.getMarks() && !Cell.getNumber()) {
            Cell.container.addClass('marks');
        }
    });
};

SudokuBoard.prototype.showBoard = function () {
    this.board.removeClass('hide-game');
};

SudokuBoard.prototype.hideBoard = function () {
    this.board.addClass('hide-game');
};

SudokuBoard.prototype.getBoardState = function () {
    var state = {
        openedCells: {},
        checkedCells: {},
        markedCells: {}
    };
    $.each(this.cells, function (i, Cell) {
        var coords = Cell.coords.toString();
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
};

SudokuBoard.prototype.selectCell = function (cell) {
    if (this.selectedCell) {
        //this.board.find('.cell.selected').removeClass('selected');
        this.selectedCell.container.removeClass('selected');
        this.selectedCell = null;
    }

    if (cell) {
        this.selectedCell = this.findCell(cell);
        this.selectedCell.container.addClass('selected');
    }
};

SudokuBoard.prototype.setCell = function (cell, number, marks) {
    if (typeof number != 'undefined') {
        if (this.setCellNumber(cell, number)) {
            this.removeColRowMarks(cell, number);
        }
    }
    if (typeof marks != 'undefined') {
        this.setCellMarks(cell, marks);
    }
};

SudokuBoard.prototype.setCellNumber = function (cell, number) {
    var Cell = this.findCell(cell);
    if (Cell.isOpen()) {
        Cell.setNumber(number);
        Cell.getNumber() ? Cell.hideMarks() : Cell.showMarks();
    }
};

SudokuBoard.prototype.addCellMark = function (cell, mark) {
    var Cell = this.findCell(cell);
    if (Cell.isOpen()) {
        Cell.addMark(mark);
        if (Cell.isEmpty()) {
            Cell.showMarks();
        }
    }
};

SudokuBoard.prototype.setCellMarks = function (cell, marks) {
    var Cell = this.findCell(cell);
    if (Cell.isOpen()) {
        Cell.setMarks(marks);
        if (Cell.isEmpty()) {
            Cell.showMarks();
        }
    }
};

SudokuBoard.prototype.removeColRowMarks = function (cell, mark) {
    var Cell = this.findCell(cell);
    this.rows[Cell.coords.getRow()].each(function (i, CellRow) {
        CellRow.removeMark(mark);
    });
    this.cols[Cell.coords.getCol()].each(function (i, CellCol) {
        CellCol.removeMark(mark);
    });
};

SudokuBoard.prototype.clearBoard = function () {
    var self = this;
    this.cells.each(function (i, Cell) {
        if (Cell.isOpen()) {
            self.setCell(Cell, 0, []);
        }
    });
};

SudokuBoard.prototype.hoverColAndRow = function (cell) { // TURNED OFF
    this.board.find('.cell.hover').removeClass('hover');
    if (cell) {
        var Cell = this.findCell(cell);
        this.board.find('.cell.' + Cell.coords.getRowCssClass() + ', .cell.' + Cell.coords.getColCssClass()).addClass('hover'); // Hover row and col
        Cell.container.removeClass('hover'); // But don't hover focus cell
    }
};

SudokuBoard.prototype.hoverNumber = function (number) {
    this.board.find('.cell.hovered').removeClass('hovered');
    number = parseInt(number);
    if (number > 0) {
        $.each(this.cells, function (i, Cell) {
            if (Cell.getNumber() == number) {
                Cell.container.addClass('hovered');
            }
        });
    }
};

SudokuBoard.prototype.showErrors = function (errors) {
    var self = this;

    if (!errors) {
        this.board.addClass('no-errors');
    } else {
        $.each(errors, function (i, coords) {
            var Cell = self.findCell(coords);
            if (Cell) {
                Cell.container.addClass('error');
            }
        });
    }

    setTimeout(function () {
        self.board.removeClass('no-errors');
        self.board.find('.cell.error').removeClass('error');
    }, 2000);
};

SudokuBoard.prototype.isFilled = function () {
    return !(this.board.find('.cell.empty').length > 0);
};

SudokuBoard.prototype.resolved = function () {
    this.container.addClass('resolved');
};

/********************************************** PUBLIC METHODS ***/
