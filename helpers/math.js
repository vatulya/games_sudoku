module.exports.random = function (min, max) {
    min = parseInt(min);
    max = parseInt(max);

    if (isNaN(min) || isNaN(max)) {
        throw new Error('wrong params');
    }
    if (max < min) {
        throw new Error('wrong params');
    }

    return parseInt(Math.random() * (max - min + 1) + min); // include max
};

module.exports.inRange = function (number, min, max) {
    number = parseInt(number);
    min = parseInt(min);
    max = parseInt(max);

    if (isNaN(number) || isNaN(min) || isNaN(max)) {
        throw new Error('wrong params');
    }
    if (max < min) {
        throw new Error('wrong params');
    }

    return (min <= number && number <= max);
};