'use strict';

/**
 * @param {String} adapterName
 * @returns {BoardStorageAbstract}
 */
let BoardStorageFactory = function (adapterName) {
    let modulePath = './storage/' + adapterName;

    return require(modulePath);
};

BoardStorageFactory.ADAPTER_MEMORY = 'memory';
BoardStorageFactory.ADAPTER_MONGOOSE = 'mongoose';

module.exports = BoardStorageFactory;