'use strict';

const validate = require('./validate'),
    _ = require('lodash'),
    assert = require('assert'),
    schema = {
        properties: {
            httpMethod: {
                conform(method) {
                    return _.isString(method) || (_.isArray(method) && _.every(method, _.isString));
                },
                messages: {
                    conform: 'httpMethod must be a string or an array of strings'
                },
                required: true,
                allowEmpty: false
            },
            path: {
                type: 'string',
                required: true,
                allowEmpty: false
            },
            middleware: {
                conform(middleware) {
                    return _.isFunction(middleware) || _.isArray(middleware);
                },
                messages: {
                    conform: 'middleware must be a function or an array of functions'
                },
                required: true,
                allowEmpty: false
            }
        }
    };

function normalize(url) {
    return url
        .replace(/[\/]+/g, '/')
        .replace(/\:\//g, '://');
}

function joinUrl(...args) {
    let url = args.join('/');
    return normalize(url);
}

function toArray(arg) {
    return !_.isArray(arg) ? [arg] : arg;
}

class Route {

    /**
     * @description Creates a new route instance
     * @param {String} packageName - The name of the LabShare package that created the API route
     * @param {Object} options
     * @param {String} options.path - The API endpoint (e.g. '/users/create')
     * @param {String} options.httpMethod - The HTTP verb
     * @param {Array|Function} options.middleware - One or more Express.JS middleware functions
     */
    constructor(packageName, options = {}) {
        assert.ok(_.isString(packageName), 'Route: "packageName" is required');
        validate({object: options, packageName, schema, type: 'route'});

        _.extend(this, options);

        this.middleware = toArray(this.middleware);

        if (!this.path.startsWith('/')) {
            this.path = `/${this.path}`;
        }

        // Namespace the API path with the LabShare package name
        if (!this.path.startsWith(`/${packageName}/`)) {
            this.path = joinUrl('/', packageName, this.path);
        }
    }
}

module.exports = Route;