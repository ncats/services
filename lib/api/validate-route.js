'use strict';

const revalidator = require('revalidator'),
    _ = require('lodash');

/**
 * @description Checks if the given route has the required properties
 * @param {object} route
 * @param {string} packageName - The name of a LabShare package
 * @returns {{message: string, isValid: boolean}}
 */
module.exports = function validateRoute(route, packageName) {
    let validation = revalidator.validate(route, {
            properties: {
                httpMethod: {
                    type: 'string',
                    required: true,
                    allowEmpty: false
                },
                path: {
                    type: 'string',
                    required: true,
                    allowEmpty: false
                },
                middleware: {
                    conform: middleware => {
                        return _.isFunction(middleware) || _.isArray(middleware);
                    },
                    messages: {
                        conform: 'middleware must be a function or an array of functions'
                    },
                    required: true,
                    allowEmpty: false
                },
                accessLevel: {
                    required: false,
                    allowEmpty: false
                }
            }
        }
    );

    var message = `Invalid route "${JSON.stringify(route)}" from package "${packageName}": `;
    validation.errors.forEach((error, index) => {
        message += error.property + ' ' + error.message + ((index < validation.errors.length - 1) ? ', ' : '. ');
    });

    return {
        message,
        isValid: validation.valid
    };
};
