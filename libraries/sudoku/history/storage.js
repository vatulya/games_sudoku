'use strict';

let HistoryStorageFactory = function (adapterName) {
    let modulePath = './storage/' + adapterName;

    return require(modulePath);
};

module.exports = HistoryStorageFactory;