'use strict';

const {userRoles, accessLevels} = require('./user-roles'),
    assert = require('assert'),
    _ = require('lodash'),
    facilityDB = _.get(global.LabShare, 'Config.facility.FacilityDB');

/**
 * @description Role-based authorization middleware
 * @param {Object} route A route definition
 */
module.exports = function ensureAuthorized(route) {
    assert.ok(_.isObject(route), '`route` must be an object');

    function authorize(req, res, next) {
        let role;
        if (!req.user) {
            role = userRoles.public;
        } else {
            role = req.user.role;
            if (_.isString(role)) {
                role = userRoles[req.user.role];
            }
        }
        let accessLevel = accessLevels[route.accessLevel || 'public'];
        if (!(accessLevel.bitMask & role.bitMask) && facilityDB !== 'mongo-facility') {
            return res.sendStatus(403);
        }

        next();
    }

    return authorize;
};
