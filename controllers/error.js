module.exports = function (env) {
    return {
        error404: function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        },
        error500: function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error/error', {
                message: err.message,
                error: env === 'development' ? err : {}
            });
        }
    };
};
