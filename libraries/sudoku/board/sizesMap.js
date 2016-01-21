'use strict';

let map = {
    "4": {
        size: 4,
        map: [
            [1, 1, 2, 2],
            [1, 1, 2, 2],
            [3, 3, 4, 4],
            [3, 3, 4, 4]
        ]
    },
    "6": {
        size: 6,
        map: [
            [1, 1, 1, 2, 2, 2],
            [1, 1, 1, 2, 2, 2],
            [3, 3, 3, 4, 4, 4],
            [3, 3, 3, 4, 4, 4],
            [5, 5, 5, 6, 6, 6],
            [5, 5, 5, 6, 6, 6]
        ]
    },
    "9": {
        size: 9,
        map: [
            [1, 1, 1, 2, 2, 2, 3, 3, 3],
            [1, 1, 1, 2, 2, 2, 3, 3, 3],
            [1, 1, 1, 2, 2, 2, 3, 3, 3],
            [4, 4, 4, 5, 5, 5, 6, 6, 6],
            [4, 4, 4, 5, 5, 5, 6, 6, 6],
            [4, 4, 4, 5, 5, 5, 6, 6, 6],
            [7, 7, 7, 8, 8, 8, 9, 9, 9],
            [7, 7, 7, 8, 8, 8, 9, 9, 9],
            [7, 7, 7, 8, 8, 8, 9, 9, 9]
        ]
    }
    // TODO: add new maps
};

let allowedSizes = [];
for (let code in map) {
    if (map.hasOwnProperty(code)) {
        allowedSizes.push(map[code].size);
    }
}

let SizesMap = {
    map: map,
    allowedSizes: allowedSizes
};

module.exports = SizesMap;
