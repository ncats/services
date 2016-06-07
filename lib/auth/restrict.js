/**
 * Request authentication middleware
 */

'use strict';

const authUser = require('./user');

/**
 * @description After successfully authenticating the user,
 * the user data is stored in the request.  If there was an error
 * authenticating the user, it responds with an error status.
 *
 * If the request does not contain an auth token, it
 * will not attempt to authenticate the user.
 */
module.exports = function restrict(req, res, next) {
    if (!req.headers || !req.headers['auth-token']) {
        return next();
    }

    let token = req.headers["auth-token"];

    function callback(error, userData) {
        if (error) {
            if (error.code === 'INVALID_RESPONSE') {
                res.status(401);
                res.send({error: error.message});
                return;
            }
            res.sendStatus(401);
            return;
        }
        req.user = userData;
        next();
    }

    authUser(token, callback)
};
