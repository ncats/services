'use strict';

/**
 * @exports A function that can load the API modules located in LabShare packages.
 *
 * @example
 * var express = require('express');
 * var app = express();
 * var ApiLoader = require('./api-loader');
 * var apiLoader = new ApiLoader(app);
 * var metadata = {
 *  somePath: 'path/to/something/useful',
 *  someValue: 5
 * }
 *
 * apiLoader.initialize();          // get all the routes and config functions from the packages
 * apiLoader.setAPIs();             // set up the API routes on the given 'app'
 *
 * // Run all the 'Config' functions provided by the package API modules.
 * //   - 'metadata' will be passed to the config functions defined by other packages
 * apiLoader.setConfig(metadata);
 *
 *  Package API module example:
 *  // packages/package-name/src/api/package-service.js
 *  var service = exports;
 *  service.Routes = [ path: '/_api/resource', httpMethod: 'GET', middleware: function (req, res, next) { ... } ];
 *  service.Config = function (data) {
 *    // custom configuration using the passed in data
 *  };
 */

const path = require('path'),
    assert = require('assert'),
    validateRoute = require('./validate-route'),
    _ = require('lodash'),
    {Router} = require('express'),
    apiUtils = require('./utils'),
    ensureAuthorized = require('../auth').EnsureAuthorized;

function normalize(url) {
    return url
        .replace(/[\/]+/g, '/')
        .replace(/\:\//g, '://');
}

function joinUrl(...args) {
    var url = args.join('/');
    return normalize(url);
}

/**
 * @description Retrieves the list of routes from the given module.
 * @param {module} serviceModule - A NodeJS module that defines routes
 * @returns {Array} - A list of route objects or an empty array
 * @private
 */
function getRoutes(serviceModule) {
    if (_.isFunction(serviceModule))  // support revealing module pattern
        serviceModule = serviceModule();
    return serviceModule.Routes || serviceModule.routes || [];
}

function getConfig(serviceModule) {
    if (_.isFunction(serviceModule))
        serviceModule = serviceModule();
    return serviceModule.Config || serviceModule.config || null;
}

/**
 * @param {Router} router - An Express JS router
 * @param {Object} route - A route definition
 * @returns {Boolean} true if the route path and method are already stored by the router otherwise false
 */
function hasRoute(router, route) {
    return _.some(router.stack, function (item) {
        return item.route.path === route.path
            && _.has(item.route.methods, route.httpMethod.toLowerCase());
    });
}

/**
 *
 * @Throws {Error} if the given the given router is not an Express JS router or one of the provided options
 * is not valid
 *
 * @param {Object} router An Express JS router that can be extended with new routes and Express JS routers
 * @param {Object} options - Overrides default settings
 *
 * options:
 * {String} options.main - A relative or absolute path to a directory containing a LabShare package. Default: ''
 * {String} options.pattern - The pattern used to match LabShare API modules
 * {Object} options.logger - Error logging provider. It must define an `error` function. Default: null
 * {Array} options.directories - A list of paths to LabShare packages that should be searched for API modules. Directories
 * that do not contain a package.json are ignored. Default: [
 * {Array} options.ignore - A list of LabShare package names that should be ignored by the loader. Default: []
 *
 * @constructor
 */
class ApiLoader {
    constructor(router, options = {}) {
        assert.ok(_.isObject(router) && router.use, '`router` must be an express JS router');

        this.router = router;
        this._routers = {};  // format: {packageName: router, ...}
        this._config = [];   // Stores package API configuration functions

        if (options.main) {
            assert.ok(_.isString(options.main), '`options.main` must be a string');
            options.main = path.resolve(options.main);
        }
        if (options.logger)
            assert.ok(_.isFunction(options.logger.error), '`options.logger` must define an `error` function');
        if (options.directories) {
            options.directories = apiUtils.wrapInArray(options.directories);
            options.directories = _.map(options.directories, directory => {
                assert.ok(_.isString(directory), '`options.directories` must contain non-empty strings');
                return path.resolve(directory);
            });
        }

        this.options = _.defaults(options, {
            pattern: 'api/*.js',
            logger: null,
            main: '',
            directories: [],
            ignore: []
        });
    }

    /**
     * @description Assigns all the LabShare package REST api routes to the Express JS router
     * passed to the ApiLoader constructor.
     *
     * Throws an exception when:
     *   - The package directory could not be read
     *   - getServices() fails to load api modules
     *
     * Logs an error if a logger is defined or throws an exception when:
     *   - A LabShare package's package.json does not contain a name
     *   - Routes defined by a LabShare package are incorrectly defined
     */
    initialize() {
        try {
            _.each(this.options.directories, this._loadRoutes.bind(this));
            if (this.options.main) {
                apiUtils.applyToNodeModulesSync(this.options.main, this._loadRoutes.bind(this));
            }
        } catch (error) {
            error.message = 'Failed to load routes: ' + error.message;
            this._handleError(error);
        }
    };

    /**
     * @description Adds the loaded routes to the stored Express router
     * @param {string} [mountPoint] - The base route where each route is accessible. For example: '/_api'.
     * @api
     */
    setAPIs(mountPoint) {
        mountPoint = mountPoint || '/';

        assert.ok(mountPoint && _.isString(mountPoint), 'ApiLoader.setAPIs: `mountPoint` must be a string!');

        _.each(this._routers, (packageRouter) => {
            this.router.use(mountPoint, packageRouter);
        });
    };

    /**
     * @description Call each LabShare package's API configuration function with the given metadata
     * @param {Object} [data] - Additional data to inject into each config function
     * @api
     */
    setConfig(data) {
        _.each(this._config, configFunction => {
            configFunction(data);
        });
    };

    /*
     * Private
     */

    /**
     * @description Locates all the API modules from the given directory
     * then assigns them to the Express JS router.
     * @param {String} directory An absolute path to a directory
     * @private
     */
    _loadRoutes(directory) {
        var manifest = apiUtils.getPackageManifest(directory);
        if (!manifest || apiUtils.isIgnored(manifest, this.options.ignore)) {
            return;
        }

        var packageName = apiUtils.getPackageName(manifest),
            router = this._routers[packageName];

        if (router) {
            return;  // avoid assigning duplicate routers to this.router
        }

        router = Router({mergeParams: true});
        this._routers[packageName] = router;

        var serviceModulePaths = apiUtils.getMatchingFilesSync(directory, this.options.pattern);

        _.each(serviceModulePaths, (serviceModulePath) => {
            var module = require(serviceModulePath),
                routes = getRoutes(module),
                configFunction = getConfig(module);

            if (configFunction) {
                if (!_.isFunction(configFunction)) {
                    this._handleError(new Error(`The 'Config' or 'config' property exported by the module "${serviceModulePath}}" must be a function!`));
                } else {
                    this._config.push(configFunction);
                }
            }

            _.each(routes, (route) => {
                this._assignRoute(route, router, packageName);
            });
        });
    };

    /**
     * @description Assigns the given route to the the given Express.js router and namespaces the route path
     * according to the package's name (/_api/some/path -> /package-name/_api/some/path)
     * @param {Object} route - A route definition containing httpMethod, path, and middleware properties.
     * @param {Object} router - An express JS router
     * @param {String} packageName - The name of the package where the route originated from.
     * @private
     */
    _assignRoute(route, router, packageName) {
        let routeValidation = validateRoute(route, packageName);
        if (!routeValidation.isValid) {
            this._handleError(new Error(routeValidation.message));
            return;
        }

        if (hasRoute(router, route)) {
            return;
        }

        this._checkIfDuplicate(route, packageName);

        route.middleware = apiUtils.wrapInArray(route.middleware);
        route.middleware.unshift(ensureAuthorized(route));  // attach authorization middleware to the route

        // Namespace the route paths
        let args = _.flatten([joinUrl('/', packageName, route.path), route.middleware]);

        switch (route.httpMethod.toUpperCase()) {
            case 'GET':
                router.get(...args);
                break;
            case 'POST':
                router.post(...args);
                break;
            case 'PUT':
                router.put(...args);
                break;
            case 'DELETE':
                router.delete(...args);
                break;
            default:
                this._handleError(new Error(`Invalid HTTP method specified for route ${route.path} from package ${packageName}`));
                break;
        }
    };

    _handleError(error) {
        if (this.options.logger) {
            this.options.logger.error(error.stack || error.message || error);
            return;
        }
        throw error;
    };

    /**
     * @description Checks if the route has already been assigned by another package
     * @param {object} route - A route definition
     * @param {string} packageName
     * @private
     */
    _checkIfDuplicate(route, packageName) {
        _.each(this._routers, (router, name) => {
            if (hasRoute(router, route) && name !== packageName) {
                this._handleError(new Error(`Duplicate route: ${route.httpMethod} ${route.path} from "${packageName}" was already loaded by "${name}"`));
            }
        });
    };
}

module.exports = ApiLoader;
