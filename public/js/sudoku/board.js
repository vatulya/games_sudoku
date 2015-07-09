function SudokuBoard(container) {
    this.container = $(container); // jQuery object of main board container. .sudoku-table

    this.cells = [];
    this.squares = [];
    this.rows = [];
    this.cols = [];

    this.init();
}

SudokuBoard.prototype.init = function () {
    this.initCells();
    this.initSquares();
    this.initRows();
};

SudokuBoard.prototype.initCells = function () {
    var cellsPerRow = [];
    var cellsPerCol = [];
    var cellsPerSquare = [];
    var initCells = function (i, el) {
        var Cell = new SudokuCell(el);
        this.cells.push(Cell);

        // Fill rows array
        if (!cellsPerRow[Cell.getRow()].length) {
            cellsPerRow[Cell.getRow()] = [];
        }
        cellsPerRow[Cell.getRow()][Cell.getCol()] = Cell;

        // Fill cols array
        if (!cellsPerCol[Cell.getCol()].length) {
            cellsPerCol[Cell.getCol()] = [];
        }
        cellsPerCol[Cell.getCol()][Cell.getRow()] = Cell;

        // Fill squares array
        // TODO: detect square number, initialize and fill array
        if (!cellsPerSquare[Cell.getRow()].length) {
            cellsPerSquare[Cell.getRow()] = [];
        }
        cellsPerSquare[Cell.getRow()][Cell.getCol()] = Cell;

    };
    this.container.find('.cell').each(initCells);
};
