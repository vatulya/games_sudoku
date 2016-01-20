'use strict';

let HistoryStorageFactory = function (adapterName) {
    let modulePath = './storage/' + adapterName;

    return require(modulePath);
};

HistoryStorageFactory.ADAPTER_MEMORY = 'memory';
HistoryStorageFactory.ADAPTER_MONGOOSE = 'mongoose';

module.exports = HistoryStorageFactory;