'use strict';

/**
 * @exports A class that can load the API modules located in LabShare packages.
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
 *  exports.routes = [ path: '/_api/resource', httpMethod: 'GET', middleware: function (req, res, next) { ... } ];
 *  exports.config = function (data) {
 *    // custom configuration using the passed in data
 *  };
 */

const path = require('path'),
    assert = require('assert'),
    _ = require('lodash'),
    {Router} = require('express'),
    apiUtils = require('./utils'),
    Route = require('./route');

/**
 * @description Retrieves the list of routes from the given module.
 * @param {module} serviceModule - A NodeJS module that defines routes
 * @returns {Array} - A list of route objects or an empty array
 * @private
 */
function getRoutes(serviceModule) {
    if (_.isFunction(serviceModule)) {  // support revealing module pattern
        serviceModule = serviceModule();
    }

    let routes = serviceModule.Routes || serviceModule.routes || [];

    // Ensure modifications ot the route properties do not mutate the original module
    return _.cloneDeep(routes);
}

/**
 * @description Retrieves the list of routes from the given module.
 * @param {module} serviceModule - A NodeJS module defining a config function
 * @returns {Function} - THe module's `config` function
 * @private
 */
function getConfig(serviceModule) {
    if (_.isFunction(serviceModule)) {
        serviceModule = serviceModule();
    }
    return serviceModule.Config || serviceModule.config || null;
}

/**
 * @param {Router} router - An Express JS router
 * @param {Object} route - A route definition
 * @returns {Boolean} true if the route path and method are already stored by the router otherwise false
 * @private
 */
function hasRoute(router, route) {
    return _.some(router.stack, item => {
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
 * @param {String} options.main - A relative or absolute path to a directory containing a LabShare package. Default: ''
 * @param {String} options.pattern - The pattern used to match LabShare API modules
 * @param {Object} options.logger - Error logging provider. It must define an `error` function. Default: null
 * @param {Array} options.directories - A list of paths to LabShare packages that should be searched for API modules. Directories
 * that do not contain a package.json are ignored. Default: [
 * @param {Array} options.ignore - A list of LabShare package names that should be ignored by the loader. Default: []
 *
 * @constructor
 */
class ApiLoader {
    constructor(router, options = {}) {
        assert.ok(_.isObject(router) && router.use, '`router` must be an express JS router');

        this.router = router;
        this.services = {};  // format: {packageName: [routes], ...}
        this.manifest = {}; // format: {packageName: packageJSON Object }
        this._config = [];   // Stores package API configuration functions

        if (options.main) {
            assert.ok(_.isString(options.main), '`main` must be a string');
            options.main = path.resolve(options.main);
        }
        if (options.logger)
            assert.ok(_.isFunction(options.logger.error), '`logger` must define an `error` function');
        if (options.directories) {
            options.directories = _.isArray(options.directories) ? options.directories : [options.directories];
            options.directories = _.map(options.directories, directory => {
                assert.ok(_.isString(directory), '`directories` must contain non-empty strings');
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
     * @description Loads all the LabShare package REST api routes
     *
     * @throws Error when:
     *   - The package directory could not be read
     *   - getServices() fails to load api modules
     *   - Routes defined by a LabShare package are missing required attributes
     *
     * Logs an error if a logger is defined or throws an exception when:
     *   - A LabShare package's package.json does not contain a name
     */
    initialize() {
        try {
            _.each(this.options.directories, this._loadRoutes.bind(this));
            if (this.options.main) {
                apiUtils.applyToNodeModulesSync(this.options.main, this._loadRoutes.bind(this));
            }
        } catch (error) {
            error.message = `Failed to load routes: ${error.message}`;
            this._handleError(error);
        }
    };

    /**
     * @description Adds the loaded routes to the stored Express router
     * @param {string} [mountPoint] - The base route where each route is accessible. For example: '/_api'.
     * @api
     */
    setAPIs(mountPoint = '/') {
        assert.ok(_.isString(mountPoint), 'ApiLoader.setAPIs: `mountPoint` must be a string!');

        _.each(this.services, (routes, packageName) => {
            let router = Router({mergeParams: true});

            _.each(routes, route => {
                this._assignRoute(route, router, packageName);
            });

            this.router.use(mountPoint, router);
        });
    };

    /**
     * @description Call each LabShare package's API configuration function with the given metadata
     * @param {Object} [data] - data to inject into each LabShare Package config function
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
     * then caches them
     * @param {String} directory An absolute path to a directory
     * @private
     */
    _loadRoutes(directory) {
        let manifest = apiUtils.getPackageManifest(directory);
        if (!manifest || apiUtils.isIgnored(manifest, this.options.ignore)) {
            return;
        }

        let packageName = apiUtils.getPackageName(manifest);
        
        this.manifest[packageName] = manifest || {};
        this.services[packageName] = this.services[packageName] || [];

        let serviceModulePaths = apiUtils.getMatchingFilesSync(directory, this.options.pattern);

        _.each(serviceModulePaths, serviceModulePath => {
            let module = require(serviceModulePath),
                routes = getRoutes(module),
                configFunction = getConfig(module);

            if (configFunction) {
                if (!_.isFunction(configFunction)) {
                    this._handleError(new Error(`The 'Config' or 'config' property exported by the module "${serviceModulePath}}" must be a function!`));
                } else {
                    this._config.push(configFunction);
                }
            }

            _.each(routes, routeOptions => {
                try {
                    let route = new Route(packageName, routeOptions);
                    this.services[packageName].push(route);
                } catch (error) {
                    this._handleError(error);
                }
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
        if (hasRoute(router, route)) {
            return;
        }

        let args = _.flatten([route.path, route.middleware]),
            httpMethod = (route.httpMethod || '').toLowerCase();

        if (!_.isFunction(router[httpMethod])) {
            this._handleError(new Error(`Invalid HTTP method specified for route ${route.path} from package ${packageName}`));
        } else {
            router[httpMethod](...args);
        }
    };

    _handleError(error) {
        if (this.options.logger) {
            this.options.logger.error(error.stack || error.message || error);
            return;
        }
        throw error;
    };
}

module.exports = ApiLoader;
