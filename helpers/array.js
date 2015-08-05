module.exports.unique = function (array) {
    var a = array.concat(),
        i,
        j,
        length = a.length;

    for (i = 0; i < length; i += 1) {
        for (j = i + 1; j < length; j += 1) {
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
    return (arrayA.length !== arrayB.length || !arrayA.every(function (element, i) {
        return element === arrayB[i];
    }));
};
