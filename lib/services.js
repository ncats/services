/**
 * The Services class initializes the Shell's API services.
 */

'use strict';

const path = require('path'),
    assert = require('assert'),
    _ = require('lodash'),
    express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    restrict = require('./auth').Restrict,
    serverUtils = require('./server-utils'),
    {SocketIOLoader, Loader} = require('./api');

class Services {

    /**
     * @description Adds authentication and service middleware to the given Express app
     * @param {Object} options
     * @param {Boolean} [options.auth] - Enable route authentication. Defaults to true.
     * @param {Object} [options.data] - Config data or other metadata to pass to the 'Config' functions executed by the ApiLoader.
     * Default: { services: Service(), apiLoader, express }
     */
    constructor(options = {}) {
        this.express = express;
        this.app = this.express();
        this.siteActive = false;
        this.options = _.defaults(options, {
            auth: true,
            logger: console,
            main: process.cwd(),
            directories: [],
            pattern: '{src/api,api}/*.js',
            connections: _.get(global.LabShare, 'Config.services.Socket.Connections'),
            data: {}
        });
        this.apiLoader = new Loader(this.app, this.options);
        this.socketLoader = null;
    }

    start() {
        let requestLoggingMode = serverUtils.isDevMode() ? 'dev' : 'combined';

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(cors());
        this.app.use(morgan(requestLoggingMode));

        if (this.options.auth) {
            this.app.use(restrict);  // Add API route authentication
        } else {
            // Add a fake user for integration testing purposes
            this.app.use((req, res, next) => {
                req.user = require('./auth/test-user');
                next();
            });
        }

        this.apiLoader.initialize();

        // Run all the package API 'config' functions
        this.apiLoader.setConfig(_.extend(this.options.data, {
            services: this,
            apiLoader: this.apiLoader,
            express: this.express,
            app: this.app
        }));

        let server = serverUtils.startServer(this.app, this.options.logger);

        this.socketLoader = new SocketIOLoader(server, this.options);

        // add API routes and socket connections unless configured not to
        if (serverUtils.isServicesEnabled()) {
            this.apiLoader.setAPIs(_.get(global.LabShare, 'Config.services.ServicePath') || '/');

            this.socketLoader = new SocketIOLoader(server, this.options);
            this.socketLoader.connect();
            this.socketLoader.on('error', error => {
                this.options.logger.error(error);
            });
            this.socketLoader.on('status', message => {
                this.options.logger.info(message);
            });

            // TODO: perform this global assignment OUTSIDE of the Services class

            global.LabShare.IO = this.io();
        } else {
            this.options.logger.warn('API services are disabled because the LabShare Service\'s configuration value for `LoadServices` is missing or set to false!');
        }
    }

    expressStatic({mountPoint, root, options}) {
        this.siteActive = true;
        this.app.use(mountPoint, this.express.static(root, options));
    }

    isSiteActive() {
        return this.siteActive;
    }

    io() {
        return this.socketLoader.getIO();
    }
}

module.exports = Services;

// if executed as a standalone script...
if (!module.parent) {
    let services = new Services();
    services.start();
}
