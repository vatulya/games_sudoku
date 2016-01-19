'use strict';

/**
 * Function-helper
 *
 * @param el
 * @returns {Sudoku}
 */
function initSudoku (el) {
    return new Sudoku(ws, new SudokuBoard(el));
}

class Sudoku {

    constructor (ws, board) {
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

    /********************************************** INIT ***/

    init () {
        this.initProperties();

        this.initEvents();

        //$(document).trigger('Sudoku:initialize', [this]); // Global event

        this.board.container.data('Sudoku', this);
        this.board.container.trigger('Sudoku:initialize', [this]); // Container event

        this.loadBoard();
    }

    initProperties () {
        this.hash = this.board.container.data('hash');

        for (var number = 0; number <= this.getSize(); number++) {
            this.allowedNumbers[number] = true; // by default all numbers are allowed
        }
    }

    initEvents () {
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
                self.systemDataResponse(data || {});
            })
            .on('forceRefresh', function (data) {
                self.forceRefresh(data || '');
            })

            .on('loadBoard', this.checkSystemDataResponse(this.loadBoardResponse.bind(this)))
            .on('checkBoard', this.checkSystemDataResponse(this.checkBoardResponse.bind(this)))
        ;
    }

    /********************************************** /INIT ***/

    /********************************************** WS METHODS ***/

    sendUserAction (action, parameters) {
        parameters = $.extend({
            '_game_hash': this.hash,
            //'_action': action,
            '_hash': this.board.getHash()
        }, parameters || {});
        this.ws.emit(action, parameters);
    }

    checkSystemDataResponse (callback) {
        var self = this;
        return function (response) {
            if (self.systemDataResponse(response)) {
                callback(response);
                //callback.call(self, response);
            }
        };
    }

    loadBoard () {
        this.sendUserAction('loadBoard');
    }

    start () {
        this.sendUserAction('start');
        this.board.show();
        this._startDurationTimer();
    }

    pause () {
        this.sendUserAction('pause');
        this.board.hide();
        this._stopDurationTimer();
    }

    setCellNumber (cell, number) {
        number = parseInt(number);
        if (number < 0 || number > this.getSize()) {
            throw new Error('Can\'t set number "' + number + '". Wrong number.');
        }

        let diff = this._doBoardAction(() => {
            this.board.setCell(cell, number);
        });
        this.sendUserAction('setCell', diff);
        this.checkAllowedNumbers();
    }

    toggleCellMark (cell, number) {
        number = parseInt(number);
        if (number < 1 || number > this.getSize()) {
            throw new Error('Can\'t set mark "' + number + '". Wrong number.');
        }

        let diff = this._doBoardAction(() => {
            this.board.toggleCellMark(cell, number);
        });
        this.sendUserAction('setCell', diff);
    }

    clearCellMark (cell) {
        let diff = this._doBoardAction(() => {
            this.board.setCellMarks(cell, []);
        });
        this.sendUserAction('setCell', diff);
    }

    clearBoard () {
        this.history.clear();
        this.board.clear();
        this.sendUserAction('clearBoard');
    }

    checkBoard () {
        this.sendUserAction('checkBoard');
    }

    /********************************************** /WS METHODS ***/

    /********************************************** WS METHODS RESPONSES ***/

    systemDataResponse (response) {
        if (response.hasOwnProperty('_system') && $.isPlainObject(response['_system'])) {
            var systemResponse = response['_system'];
            if (systemResponse.hasOwnProperty('microtime') && systemResponse['microtime'] > this.lastSystemDataMicrotime) {
                this.lastSystemDataMicrotime = systemResponse['microtime'];
                if (this._checkGameHash(systemResponse['gameHash'] || '')) {
                    if (systemResponse.resolved) {
                        this._win();
                    } else {
                        this.history.setUndo(systemResponse['undoMove'] || {});
                        this.history.setRedo(systemResponse['redoMove'] || {});
                        this._updateGameServerTime(systemResponse['duration']);
                    }
                    return true;
                }
                // TODO: add check win-game code
                // TODO: add server-side check win-game on each doUserAction
            }
        }
        return false;
    }

    loadBoardResponse (response) {
        this.board.fill(response);
        this.checkAllowedNumbers();
        this.start();
    }

    checkBoardResponse (response) {
        if (response.hasOwnProperty('resolved') && response.resolved) {
            this.win();
        } else {
            this.board.showErrors(response.errors || []);
        }
    }

    /********************************************** /WS METHODS RESPONSES ***/

    /********************************************** PROTECTED METHODS ***/

    _doBoardAction (action) {
        let oldState = this.board.getState();

        action();

        return SudokuBoard.getDiff(oldState, this.board.getState());
    }

    _checkGameHash () {
        // TODO: add logic to this method
        return true;
    }

    _startDurationTimer () {
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
    }

    _stopDurationTimer () {
        clearInterval(this.durationTimer);
        this.durationTimer = false;
    }

    _updateGameServerTime (time) {
        this.duration = time;
    }

    _win () {
        this.board.setResolved();
        this._stopDurationTimer();
    }

    _forceRefresh (response) {
        alert('Принудительная перезагрузка страницы. Причина: ' + (response['reason'] || 'UNKNOWN REASON'));
        window.location.reload();
    }

    /********************************************** /PROTECTED METHODS ***/

    /********************************************** PUBLIC METHODS ***/

    getSize () {
        return this.board.size;
    }

    selectCell (cell) {
        if (cell) {
            this.board.selectCell(cell);
        }
    }

    unselectCell () {
        this.board.selectCell();
    }

    getSelectedCell () {
        return this.board.selectedCell;
    }

    checkNumber (number) {
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
        }
    }

    useHistory (historyType) {
        var move = historyType == 'undo' ? this.history.getUndo() : this.history.getRedo();
        this.history.clear();

        let diff = this._doBoardAction(() => {
            this.board.applyState(move);
        });
        this.sendUserAction('useHistory', $.extend({historyType: historyType}, diff));
        this.checkAllowedNumbers();
    }

    checkAllowedNumbers () {
        var self = this;
        var numbersCount = {};
        $.each(this.board.cells, function (key, Cell) {
            if (Cell.getNumber()) {
                var number = '' + Cell.getNumber(); // to string because I am using it as hash key
                numbersCount.hasOwnProperty(number) ? numbersCount[number]++ : numbersCount[number] = 1;
            }
        });
        $.each(this.allowedNumbers, function (number, isAllowed) {
            self.allowedNumbers[number] = !(numbersCount.hasOwnProperty('' + number) && numbersCount['' + number] >= self.size);
        });

        this.trigger('allowedNumbersChanged', [this.allowedNumbers]);
    }

    /********************************************** /PUBLIC METHODS ***/

}

$.extend(Sudoku.prototype, MixinEvent);
