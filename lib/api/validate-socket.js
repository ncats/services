'use strict';

const revalidator = require('revalidator'),
    _ = require('lodash');

/**
 * @description Checks if the given socket has the required properties
 * @param {object} socket - An object that defines a socket.io connection event handler
 * @param {string} packageName - The name of a LabShare package
 * @returns {{message: string, isValid: boolean}}
 */
module.exports = function validateSocket(socket, packageName) {
    let validation = revalidator.validate(socket, {
            properties: {
                event: {
                    type: 'string',
                    required: true,
                    allowEmpty: false
                },
                onEvent: {
                    required: true,
                    allowEmpty: false,
                    conform(onEvent) {
                        return _.isFunction(onEvent);
                    },
                    messages: {
                        conform: 'onEvent must be a function'
                    },
                },
                middleware: {
                    conform(middleware) {
                        return _.isFunction(middleware) || _.isArray(middleware);
                    },
                    messages: {
                        conform: 'middleware must be a function or an array of functions'
                    },
                    required: false,
                    allowEmpty: true
                }
            }
        }
    );

    let message = `Invalid socket definition "${JSON.stringify(socket)}" from LabShare package "${packageName}": `;

    validation.errors.forEach((error, index) => {
        message += `${error.property} ${error.message}${(index < validation.errors.length - 1) ? ', ' : '. '}`;
    });

    return {
        message,
        isValid: validation.valid
    };
};
