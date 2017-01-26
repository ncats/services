'use strict';

const validate = require('./validate'),
    _ = require('lodash'),
    assert = require('assert'),
    schema = {
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
    };

function toArray(arg) {
    return !_.isArray(arg) ? [arg] : arg;
}

class Socket {

    /**
     * @description Creates a new socket instance
     * @param {String} packageName - The name of the LabShare package that created the socket definition
     * @param {Object} options
     * @param {String} options.event - The event name
     * @param {String} options.onEvent - The main event handler
     * @param {Array.<Function>|Function} [options.middleware] - One or more connect-style middleware functions
     */
    constructor(packageName, options = {}) {
        assert.ok(_.isString(packageName), 'Socket: "packageName" is required');
        validate({object: options, packageName, type: 'socket', schema});

        _.extend(this, options);

        this.middleware = this.middleware || [];
        this.middleware = toArray(this.middleware);
    }
}

module.exports = Socket;
