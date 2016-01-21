'use strict';

module.exports = (env) => {
    return {
        error404: (req, res, next) => {
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        },
        error500: (err, req, res, next) => {
            res.status(err.status || 500);
            res.render('error/error', {
                message: err.message,
                error: env === 'development' ? err : {}
            });
            next(err);
        }
    };
};
