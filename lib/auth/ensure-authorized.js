var {userRoles, accessLevels} = require('./user-roles'),
    assert = require('assert'),
    _ = require('lodash');

/**
 * @description Role-based authorization middleware
 *
 * @param {Object} route A route definition
 */
module.exports = function ensureAuthorized(route) {
    assert.ok(_.isPlainObject(route), '`route` must be an object');

    function authorize(req, res, next) {
        var role;
        if (!req.user) {
            role = userRoles.public;
        } else {
            role = req.user.role;
            if (_.isString(role)) {
                role = userRoles[req.user.role];
            }
        }
        var accessLevel = route.accessLevel || accessLevels.public;
        if (!(accessLevel.bitMask & role.bitMask))
            return res.sendStatus(403);
        return next();
    }

    return authorize;
};
