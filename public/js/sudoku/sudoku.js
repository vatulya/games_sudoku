function initSudoku(el) {
    return new Sudoku(ws, new SudokuBoard(el));
}

function Sudoku(ws, board) {
    this.ws = ws; // websocket object
    this.board = board; // sudoku board object
    this.history = new SudokuHistory(this);

    this.hash = '';
    this.isMarkMode = false;
    this.allowedNumbers = [];

    this.durationTimer = 0; // Update duration timer
    this.duration = 0;
    this.lastSystemDataMicrotime = 0;

    this.init();
}

$.extend(Sudoku.prototype, MixinEvent);

/********************************************** INIT ***/

Sudoku.prototype.init = function () {
    this.initProperties();

    this.initEvents();

    //$(document).trigger('Sudoku:initialize', [this]); // Global event

    this.board.container.data('Sudoku', this);
    this.board.container.trigger('Sudoku:initialize', [this]); // Container event

    this.loadBoard();
};

Sudoku.prototype.initProperties = function () {
    this.hash = this.board.container.data('hash');

    for (var number = 0; number <= this.getSize(); number++) {
        this.allowedNumbers[number] = true; // by default all numbers are allowed
    }
};

Sudoku.prototype.initEvents = function () {
    var self = this;

    $(document)
        .on('game.pause', function (e, state) {
            state ? self.pause() : self.start();
        })
    ;

    this.ws
        .on('open', function (data) {
        })
        .on('close', function (data) {
            self._stopPing();
        })
        .on('systemData', function (data) {
            self.systemDataResponse(data['_system'] || {});
        })
        .on('forceRefresh', function (data) {
            self.forceRefresh(data['reason'] || '');
        })

        .on('loadBoard', this.checkSystemDataResponse(this.loadBoardResponse.bind(this)))
        .on('checkBoard', this.checkSystemDataResponse(this.checkBoardResponse.bind(this)))
    ;
};

/********************************************** /INIT ***/

/********************************************** WS METHODS ***/

Sudoku.prototype.sendUserAction = function (action, parameters) {
    parameters = $.extend({
        '_game_hash': this.hash,
        //'_action': action,
        '_hash': this.board.getBoardHash()
    }, parameters || {});
    this.ws.emit(action, parameters);
    //.then(function(response) {
    //    if ($Sudoku.systemDataResponse(response)) {
    //        callback(response);
    //    }
    //});
};

Sudoku.prototype.checkSystemDataResponse = function (callback) {
    var self = this;
    return function (response) {
        if (self.systemDataResponse(response)) {
            callback(response);
            //callback.call(self, response);
        }
    };
};

Sudoku.prototype.loadBoard = function () {
    this.sendUserAction('loadBoard');
};

Sudoku.prototype.start = function () {
    this.sendUserAction('start');
    this.board.showBoard();
    this._startDurationTimer();
};

Sudoku.prototype.pause = function () {
    this.sendUserAction('pause');
    this.board.hideBoard();
    this._stopDurationTimer();
};

Sudoku.prototype.setCellNumber = function (cell, number) {
    number = parseInt(number);
    if (number < 0 || number > this.getSize()) {
        throw new Error('Can\'t set number "' + number + '". Wrong number.');
    }
    this.board.setCell(cell, number);
    this.sendUserAction('setCell', this.board.getBoardState());
    this.checkAllowedNumbers();
};

Sudoku.prototype.toggleCellMark = function (cell, number) {
    number = parseInt(number);
    if (number < 1 || number > this.getSize()) {
        throw new Error('Can\'t set mark "' + number + '". Wrong number.');
    }
    this.board.toggleCellMark(cell, number);
    this.sendUserAction('setCell', this.board.getBoardState());
};

Sudoku.prototype.clearCellMark = function (cell) {
    this.board.setCellMarks(cell, []);
    this.sendUserAction('setCell', this.board.getBoardState());
};

Sudoku.prototype.clearBoard = function () {
    this.history.clear();
    this.board.clearBoard();
    this.sendUserAction('clearBoard');
};

Sudoku.prototype.checkBoard = function () {
    this.sendUserAction('checkBoard');
};

/********************************************** /WS METHODS ***/

/********************************************** WS METHODS RESPONSES ***/

Sudoku.prototype.systemDataResponse = function (response) {
    if (response.hasOwnProperty('_system') && $.isPlainObject(response['_system'])) {
        var systemResponse = response['_system'];
        if (systemResponse.hasOwnProperty('microtime') && systemResponse['microtime'] > this.lastSystemDataMicrotime) {
            this.lastSystemDataMicrotime = systemResponse['microtime'];
            if (this._checkGameHash(systemResponse['gameHash'] || '')) {
                this.history.setUndo(systemResponse['undoMove'] || {});
                this.history.setRedo(systemResponse['redoMove'] || {});
                this._updateGameServerTime(systemResponse['duration']);
                return true;
            }
        }
    }
    return false;
};

Sudoku.prototype.loadBoardResponse = function (response) {
    this.board.fillBoard(response);
    this.checkAllowedNumbers();
    this.start();
};

Sudoku.prototype.checkBoardResponse = function (response) {
    if (response.hasOwnProperty('resolved') && response.resolved) {
        this.win();
    } else {
        this.board.showErrors(response.errors || []);
    }
};

/********************************************** /WS METHODS RESPONSES ***/

/********************************************** PROTECTED METHODS ***/

Sudoku.prototype._checkGameHash = function () {
    // TODO: add logic to this method
    return true;
};

Sudoku.prototype._startDurationTimer = function () {
    var self = this;
    var timer = this.board.container.find('.game-time');
    if (!this.durationTimer && timer.length) {
        this.durationTimer = setInterval(function () {
            if (self.duration > 0) {
                self.duration += 1;
                timer.html(this.duration.toDDHHMMSS(false, true));
            }
        }, 1000);
    }
};

Sudoku.prototype._stopDurationTimer = function () {
    clearInterval(this.durationTimer);
    this.durationTimer = false;
};

Sudoku.prototype._updateGameServerTime = function (time) {
    this.duration = time;
};

Sudoku.prototype._win = function () {
    this.board.resolved();
    this._stopDurationTimer();
    this._stopPing();
};

Sudoku.prototype._forceRefresh = function (reason) {
    alert('Принудительная перезагрузка страницы. Причина: ' + reason);
    window.location.reload();
};

/********************************************** /PROTECTED METHODS ***/

/********************************************** PUBLIC METHODS ***/

Sudoku.prototype.getSize = function () {
    return this.board.size;
};

Sudoku.prototype.selectCell = function (cell) {
    if (cell) {
        this.board.selectCell(cell);
    }
};

Sudoku.prototype.unselectCell = function () {
    this.board.selectCell();
};

Sudoku.prototype.getSelectedCell = function () {
    return this.board.selectedCell;
};

Sudoku.prototype.checkNumber = function (number) {
    var Cell = this.getSelectedCell();
    if (Cell) {
        this.history.clear();
        if (this.isMarkMode) {
            if (number > 0) {
                this.toggleCellMark(Cell, number)
            } else {
                this.clearCellMark(Cell);
            }
        } else {
            this.setCellNumber(Cell, number);
        }
        this.board.hoverNumber(Cell.getNumber());
        this.checkWinGame();
    }
};

Sudoku.prototype.useHistory = function (historyType) {
    var result = historyType == 'undo' ? this.history.useUndo() : this.history.useRedo();
    if (result) {
        this.sendUserAction(historyType + 'Move', this.board.getBoardState());
    }
};

Sudoku.prototype.checkAllowedNumbers = function () {
    var self = this;
    var numbersCount = {};
    $.each(this.board.cells, function (key, Cell) {
        if (Cell.getNumber()) {
            var number = '' + Cell.getNumber(); // to string because I am using it as hash key
            numbersCount.hasOwnProperty(number) ? numbersCount[number]++ : numbersCount[number] = 1;
        }
    });
    $.each(this.allowedNumbers, function(number, isAllowed) {
        self.allowedNumbers[number] = !(numbersCount.hasOwnProperty('' + number) && numbersCount['' + number] >= self.size);
    });

    this.trigger('allowedNumbersChanged', this.allowedNumbers);
};

Sudoku.prototype.checkWinGame = function () {
    if (this.board.isFilled()) {
        this.checkBoard();
    }
};

/********************************************** /PUBLIC METHODS ***/


