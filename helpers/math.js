module.exports.random = function (min, max) {
    min = parseInt(min);
    max = parseInt(max); // include max
    if (isNaN(min) || isNaN(max)) return Error('wrong params');
    if (max < min) return Error('wrong params');
    return parseInt(Math.random() * (max - min + 1) + min);
};