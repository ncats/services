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
    helmet = require('helmet'),
    serverUtils = require('./server-utils'),
    {SocketIOLoader, Loader} = require('./api');

class Services {

    /**
     * @description Sets up HTTP and Socket APIs using routes, socket connections, and configuration functions defined by LabShare API packages
     * @param {Object} [options]
     * @param {Object} [options.security] - Options to pass to the helmet, cors, and express-session libraries
     * @param {Boolean} [options.loadServices] - Do not load APIs if false. Default: true
     * @param {String} [options.main] - A relative or absolute path to a directory containing a LabShare package. Default: process.cwd()
     * @param {String} [options.pattern] - The pattern used to match LabShare API modules
     * @param {Object} [options.logger] - Error logging provider. It must define an `error` function. Default: console
     * @param {Array} [options.directories] - A list of paths to LabShare packages that should be searched for API modules. Directories
     * that do not contain a package.json are ignored. Default: []
     * @param {Array} [options.ignore] - A list of LabShare package names that should be ignored by the API and Socket loaders. Default: []
     */
    constructor(options = {}) {
        let logger = _.get(global.LabShare, 'Logger', console);  // Default to the logger instance initialized by the LSC LabShare package

        this._app = express();
        this._initialized = false;
        this._servicesActive = false;
        this._isProduction = this._app.get('env') === 'production';
        this._options = _.defaultsDeep(options,  {
            logger,
            socket:{
                connections: []
            },
            loadServices: true,
            pattern: '{src/api,api}/*.js',
            main: process.cwd(),
            directories: [],
            morgan: {
                enable: true,
                format: this._isProduction ? 'combined' : 'dev',
                options: {
                    // Workaround to add fluentD integration with the morgan logging library
                    stream: _.get(this.logger, 'stream.write')
                }
            },
            security: {
                sessionOptions: {
                    secret: require('crypto').randomBytes(64).toString('hex'),
                    resave: false,
                    saveUninitialized: false,
                    name: 'sessionID',
                    cookie: {
                        httpOnly: true,
                        maxAge: 60 * 60 * 1000,      // 1 hour
                        secure: this._isProduction   // only allow SSL cookies in production by default
                    }
                },
                contentSecurityPolicy: false,
                hpkp: false,
                referrerPolicy: {
                    policy: 'no-referrer'
                },
                corsOptions: {
                    origin: '*',
                    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                    preflightContinue: false
                }
            }
        });

        this.server = serverUtils.createServer(this._app, this._options.logger);
        this._apiLoader = new Loader(this._app, this._options);
        this._socketLoader = new SocketIOLoader(this.server, this._options);
    }

    /**
     * @description Load the services and assign middleware but do not start up the server or establish
     * any socket connections yet
     * @api
     */
    initialize() {
        this._initialized = true;

        this._app.use(helmet(this._options.security));
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({extended: true}));
        this._app.use(cors(this._options.security.corsOptions));

        if (this._options.morgan.enable) {
            this._app.use(morgan(this._options.morgan.format, this._options.morgan.options));
        }

        this._app.use(cookieParser());

        // See: https://github.com/expressjs/session#cookiesecure
        if (this._isProduction) {
            this._app.set('trust proxy', 1);  // trust first proxy
        }

        this._app.use(require('express-session')(this._options.security.sessionOptions));

        this._socketLoader.initialize();
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
            sockets: this._socketLoader.getSockets(),
            app: this._app,
            io: this.io()
        });
    }

    /**
     * @description Starts the server and sets up socket connections
     * @returns {Object} The Node.js HTTP or HTTPS server
     * @api
     */
    start() {
        if (!this._initialized) {
            this.initialize();
        }

        // Run all the package API 'config' functions
        this._apiLoader.setConfig({
            apiLoader: this._apiLoader,
            app: this._app
        });

        this._servicesActive = true;

        serverUtils.startServer(this.server, this._options.logger);

        // add API routes and socket connections unless configured not to
        if (this._options.loadServices) {
            this._apiLoader.setAPIs(_.get(global.LabShare, 'Config.services.ServicePath') || '/');

            this._socketLoader.connect();
            this._socketLoader.on('error', error => {
                this._options.logger.error(error);
            });
            this._socketLoader.on('status', message => {
                this._options.logger.info(message);
            });

            // TODO: perform this global assignment OUTSIDE of the Services class if possible

            _.set(global, 'LabShare.IO', this.io());
        } else {
            this._options.logger.warn('API services are disabled because Service\'s `options.loadServices` is missing or set to false!');
        }

        return this.server;
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
