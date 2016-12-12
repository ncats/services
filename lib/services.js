/**
 * The Services class initializes the Shell's API services.
 */

'use strict';

const _ = require('lodash'),
    express = require('express'),
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    serverUtils = require('./server-utils'),
    {SocketIOLoader, Loader} = require('./api');

class Services {

    /**
     * @description Sets up HTTP and Socket APIs using routes, socket connections, and configuration functions defined by LabShare API packages
     * @param {Object} [options]
     * @param {Object} [options.data] - Config data or other metadata to pass to the LabShare package 'config' functions called by the ApiLoader.
     * Default: { services: Service(), apiLoader, express }
     * @param {Boolean} [options.loadServices] - Do not load APIs if false. Default: true
     * @param {String} [options.main] - A relative or absolute path to a directory containing a LabShare package. Default: process.cwd()
     * @param {String} [options.pattern] - The pattern used to match LabShare API modules
     * @param {Object} [options.logger] - Error logging provider. It must define an `error` function. Default: console
     * @param {Array} [options.directories] - A list of paths to LabShare packages that should be searched for API modules. Directories
     * that do not contain a package.json are ignored. Default: []
     * @param {Array} [options.ignore] - A list of LabShare package names that should be ignored by the API and Socket loaders. Default: []
     */
    constructor(options = {}) {
        this.app = express();
        this._initialized = false;
        this._servicesActive = false;
        this._options = _.defaults(options, {
            logger: _.get(global.LabShare, 'Logger', console),  // Default to the logger instance from the LSC LabShare package
            main: process.cwd(),
            directories: [],
            pattern: '{src/api,api}/*.js',
            connections: _.get(global.LabShare, 'Config.services.Socket.Connections'),
            data: {},
            loadServices: true
        });
        this._siteActive = false;
        this._apiLoader = new Loader(this.app, this._options);
        this._socketLoader = new SocketIOLoader(this._options);
    }

    /**
     * @description Load the services and assign middleware but do not start up the server or establish
     * any socket connections yet
     * @api
     */
    initialize() {
        this._initialized = true;

        let requestLoggingMode = serverUtils.isDevMode() ? 'dev' : 'combined';

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(cors());

        // Workaround to add fluentD integration with the morgan logging library
        if (_.get(this._options, 'logger.stream.write')) {
            this.app.use(morgan(requestLoggingMode, {stream: this._options.logger.stream}));
        } else {
            this.app.use(morgan(requestLoggingMode));
        }

        this.app.use(cookieParser());

        this.app.use(require('express-session')({
            secret: _.get(global.LabShare, 'Config.services.Secret') || require('crypto').randomBytes(64).toString('hex'),
            resave: false,
            saveUninitialized: false
        }));

        this._apiLoader.initialize();
    }

    /**
     * @description Allows additional modifications to be made to the Express instance and routes before the services are started up.
     * @param {Function} func - A configuration function that receives all the API routes and the express app as arguments
     * @api
     */
    config(func) {
        if (!this._initialized) {
            this.initialize();
        }

        if (this._servicesActive) {
            throw new Error('You cannot modify the LabShare API services after starting up the server!');
        }
        
        func({
            services: this._apiLoader.services,
            app: this.app
        });
    }

    /**
     * @description Starts the server and sets up socket connections
     * @api
     */
    start() {
        if (!this._initialized) {
            this.initialize();
        }

        // Run all the package API 'config' functions
        this._apiLoader.setConfig(_.extend(this._options.data, {
            services: this,
            apiLoader: this._apiLoader,
            express,
            app: this.app
        }));

        this._servicesActive = true;

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

    /**
     *
     * @param {String} mountPoint
     * @param {String} root
     * @param {Object} options
     */
    expressStatic({mountPoint, root, options}) {
        this._siteActive = true;
        this.app.use(mountPoint, express.static(root, options));
    }

    /**
     *
     * @returns {boolean}
     */
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
