
module.exports = function (env) {
    return function (err, req, res, next) {
        if (env !== 'production') {
            console.log(process.memoryUsage());
        }
    };
};
