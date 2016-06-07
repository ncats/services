'use strict';

const rest = require('restler'),
    _ = require('lodash'),
    assert = require('assert'),
    revalidator = require('revalidator');

/**
 * @description Authenticates a user with the LabShare API
 * @param {String} token - An authentication token
 * @param {Function} callback - Receives the response as the 2nd argument on success,
 * otherwise it receives error or an error status code as the 1st argument.
 */
module.exports = function authUser(token, callback) {
    let reqMsg;

    assert.ok(_.isFunction(callback), '`callback` must be a function');

    if (!token) {
        return callback(new Error('Invalid token'));
    }

    if (_.get(global.LabShare, 'Tokens', null)) {
        var tokenCache = global.LabShare.Tokens,
            user = tokenCache.getUserForToken(token);
        return callback(null, user);
    }

    reqMsg = {
        headers: {'auth-token': token}
    };

    let authUrl = (_.get(global.LabShare, 'Config.services.Auth.Url') || 'https://a.labshare.org') + '/_api/auth/me';

    rest.get(authUrl, reqMsg).on('complete', function onResponse(data, response) {
        if (_.isError(data))
            return callback(data);
        if (response.statusCode === 200) {
            var validation = validateAuth(data),
                message = 'User auth response is invalid: ';

            if (!validation.valid) {
                validation.errors.forEach(function (error) {
                    message += error.property + ' ' + error.message + '. ';
                });

                var validationError = new Error(message + '\n' + JSON.stringify(data, null, 2));
                validationError.code = 'INVALID_RESPONSE';
                return callback(validationError);
            }
            return callback(null, data);
        }
        callback(response.statusCode);
    });
};

function validateAuth(authInfo) {
    var constraints = {
        properties: {
            email: {
                description: 'The user\'s email address',
                type: 'string',
                format: 'email',
                required: true
            },
            username: {
                description: 'The user\'s login name',
                type: 'string',
                required: true
            }
        }
    };

    return revalidator.validate(authInfo, constraints);
}
