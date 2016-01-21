'use strict';

module.exports.unique = function (array) {
    let a = array.concat(),
        length = a.length;

    for (let i = 0; i < length; i += 1) {
        for (let j = i + 1; j < length; j += 1) {
            if (a[i] === a[j]) {
                j -= 1;
                a.splice(j, 1);
                length = a.length;
            }
        }
    }

    return a;
};

module.exports.isDifferent = function (arrayA, arrayB) {
    return (arrayA.length !== arrayB.length || !arrayA.every((element, i) => {
        return element === arrayB[i];
    }));
};
