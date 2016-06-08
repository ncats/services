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
     * @param {Object} [options]
     * @param {Boolean} [options.auth] - Enable route authentication. Defaults to true.
     * @param {Object} [options.data] - Config data or other metadata to pass to the 'Config' functions executed by the ApiLoader.
     * Default: { services: Service(), apiLoader, express }
     * @param {Boolean} [options.loadServices] - Do not load APIs if false. Default: true
     */
    constructor(options = {}) {
        this.app = express();
        this._options = _.defaults(options, {
            auth: true,
            logger: console,
            main: process.cwd(),
            directories: [],
            pattern: '{src/api,api}/*.js',
            connections: _.get(global.LabShare, 'Config.services.Socket.Connections'),
            data: {},
            loadServices: true
        });
        this._express = express;
        this._siteActive = false;
        this._apiLoader = new Loader(this.app, this._options);
        this._socketLoader = new SocketIOLoader(this._options);
    }

    start() {
        let requestLoggingMode = serverUtils.isDevMode() ? 'dev' : 'combined';

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(cors());
        this.app.use(morgan(requestLoggingMode));

        if (this._options.auth) {
            this.app.use(restrict);  // Add API route authentication
        } else {
            // Add a fake user for integration testing purposes
            this.app.use((req, res, next) => {
                req.user = require('./auth/test-user');
                next();
            });
        }

        this._apiLoader.initialize();

        // Run all the package API 'config' functions
        this._apiLoader.setConfig(_.extend(this._options.data, {
            services: this,
            apiLoader: this._apiLoader,
            express: this._express,
            app: this.app
        }));

        let server = serverUtils.startServer(this.app, this._options.logger);

        // add API routes and socket connections unless configured not to
        if (this._options.loadServices) {
            this._apiLoader.setAPIs(_.get(global.LabShare, 'Config.services.ServicePath') || '/');

            this._socketLoader.connect(server);
            this._socketLoader.on('error', error => {
                this._options.logger.error(error);
            });
            this._socketLoader.on('status', message => {
                this._options.logger.info(message);
            });

            // TODO: perform this global assignment OUTSIDE of the Services class

            global.LabShare.IO = this.io();
        } else {
            this._options.logger.warn('API services are disabled because Service\'s `options.loadServices` is missing or set to false!');
        }
    }

    expressStatic({mountPoint, root, options}) {
        this._siteActive = true;
        this.app.use(mountPoint, this._express.static(root, options));
    }

    isSiteActive() {
        return this._siteActive;
    }

    io() {
        return this._socketLoader.getIO();
    }
}

module.exports = Services;

// if executed as a standalone script...
if (!module.parent) {
    let services = new Services();
    services.start();
}
