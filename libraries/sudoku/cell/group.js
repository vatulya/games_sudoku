'use strict';

class CellGroup {

    constructor (cells) {
        this.cells = cells; // [Cell]

        if (!this.checkCellsStructure()) {
            throw new Error('Wrong cells structure. Can\'t initialize cell group');
        }
    }

    checkCellsStructure () {
        return true;
    }

    isCorrect () {
        return true;
    }

}

module.exports = CellGroup;
