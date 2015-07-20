function Group(cells) {
    this.cells = cells; // [Cell]

    if (!this.checkCellsStructure()) {
        throw new Error('Wrong cells structure. Can\'t initialize cell group');
    }
}

Group.prototype.checkCellsStructure = function () {
    return true;
};

Group.prototype.isCorrect = function () {
    return true;
};

module.exports = Group;
