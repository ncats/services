/**
 * @module The Services class initializes the Shell's HTTP and Socket API services.
 */

'use strict';

const apm = require('elastic-apm-node').start(),
    _ = require('lodash'),
    express = require('express'),
    crypto = require('crypto'),
    cookieParser = require('cookie-parser'),
    bodyParserMiddleware = require('body-parser'),
    session = require('express-session'),
    connectRedis = require('connect-redis'),
    morganMiddleware = require('morgan'),
    helmet = require('helmet'),
    serverUtils = require('./server-utils'),
    {SocketIOLoader, Loader} = require('./api'),
    dotEnv = require('dotenv'),
    path = require('path'),
    status = require('./middleware/status'),
    memoryStore = require('memorystore'),
    lb4ApiLoader = require('@labshare/lb4-legacy-loader');
;

// Load environment variables using a local .env file (see: https://www.npmjs.com/package/dotenv)
dotEnv.config({path: path.join(process.cwd(), '.env')});

class Services {

    /**
     * @description Sets up HTTP and Socket APIs using routes, socket connections, and configuration functions defined by LabShare API packages
     * @param {Object} [options]
     * @param {Object} [options.listen] - Port/host configuration options
     * @param {Object} [options.security] - Options to pass to the helmet, and express-session libraries
     * @param {String} [options.main] - A relative or absolute path to a directory containing a LabShare package. Default: process.cwd()
     * @param {String} [options.pattern] - The pattern used to match LabShare API modules
     * @param {Object} [options.logger] - Error logging provider. It must define an `error` function. Default: console
     * @param {Array} [options.directories] - A list of paths to LabShare packages that should be searched for API modules. Directories
     * that do not contain a package.json are ignored. Default: []
     * @param {Array} [options.ignore] - A list of LabShare package names that should be ignored by the API and Socket loaders. Default: []
     */
    constructor(options = {}) {
        this._app = express();
        this._initialized = false;
        this._servicesActive = false;
        this._isProduction = this._app.get('env') === 'production';
        this._options = _.defaultsDeep(options, {
            listen: {
                port: 8000,
                url: 'http://127.0.0.1'
            },
            https: {},
            restApiRoot: '/',
            logger: console,
            socket: {
                connections: []
            },
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
            bodyParser: {
                json: {},
                urlencoded: {
                    extended: true
                }
            },
            security: {
                sessionOptions: {
                    secret: crypto.randomBytes(64).toString('hex'),
                    resave: false,
                    saveUninitialized: false,
                    name: 'sessionID',
                    cookie: {
                        httpOnly: true,
                        maxAge: 60 * 60 * 1000,      // 1 hour
                        secure: this._isProduction   // only allow SSL cookies in production by default
                    },
                    store: 'memorystore',            // Defaults to https://www.npmjs.com/package/memorystore
                    storeOptions: {
                        checkPeriod: 86400000        // prune expired entries every 24h
                    }
                },
                contentSecurityPolicy: false,
                hpkp: false,
                referrerPolicy: {
                    policy: 'no-referrer'
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
        const {morgan, security, bodyParser} = this._options;

        this._initialized = true;

        this._app.use(helmet(security));
        this._app.use(bodyParserMiddleware.json(bodyParser.json));
        this._app.use(bodyParserMiddleware.urlencoded(bodyParser.urlencoded));

        if (morgan.enable) {
            this._app.use(morganMiddleware(morgan.format, morgan.options));
        }

        this._app.use(cookieParser());

        // Set up express-session middleware
        this._initializeSessions();

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
     * @description Starts the server, sets up socket connections, and exposes the Socket.IO instance as a global
     * @returns {Object} The Node.js HTTP or HTTPS server
     * @api
     */
    async start() {
        // TODO: ServicePath option is deprecated on next major release
        let mountPoint = this._options.ServicePath || this._options.restApiRoot;

        if (!this._initialized) {
            this.initialize();
        }

        // Attach basic health check middleware
        this._app.get(mountPoint, status())

        // Run all the package API 'config' functions

        // this._apiLoader.setConfig({
        //     apiLoader: this._apiLoader,
        //     app: this._app
        // });

        this._servicesActive = true;

        serverUtils.startServer({
            server: this.server,
            logger: this._options.logger,
            port: this._options.listen.port
        });

        // add API routes and socket connections unless configured not to
//        this._apiLoader.setAPIs(mountPoint);

        const lb4LegacyLoaderApp = new lb4ApiLoader.LegacyApiLoaderApplication();
        this._app.use('/api', lb4LegacyLoaderApp.requestHandler);

        await lb4LegacyLoaderApp.boot();
        await lb4LegacyLoaderApp.start();

        this._options.logger.info(`HTTP APIs enabled on mount path: "${mountPoint}"...`);

        this._socketLoader.connect();
        this._socketLoader.on('error', error => {
            this._options.logger.error(error);
        });
        this._socketLoader.on('status', message => {
            this._options.logger.info(message);
        });

        if (!_.get(global, 'LabShare.IO')) {
            _.set(global, 'LabShare.IO', this.io());
        }

        return this.server;
    }

    io() {
        return this._socketLoader.getIO();
    }

    _initializeSessions() {
        const sessionOptions = this._options.security.sessionOptions;
        let SessionStore;

        // See: https://github.com/expressjs/session#cookiesecure
        if (sessionOptions.cookie.secure) {
            this._options.logger.info('Enabling "trust proxy" since HTTPS reverse proxy is likely enabled. See https://expressjs.com/en/guide/behind-proxies.html for details.');
            this._app.set('trust proxy', 1);
        }

        // Allow a constructor to be passed in through the 'store' option,
        // but first check if the store type was defined by its NPM module name
        if (_.isString(sessionOptions.store)) {
            switch (sessionOptions.store) {
                case 'memorystore':
                    SessionStore = memoryStore(session);
                    break;
                case 'connect-redis':
                    SessionStore = connectRedis(session);
                    break;
                default:
                    throw new Error(`Session store "${sessionOptions.store}" is not supported by LabShare Services yet.`);
            }

            sessionOptions.store = new SessionStore(sessionOptions.storeOptions);
        }

        this._app.use(session(sessionOptions));
    }
}

module.exports = Services;

// if executed as a standalone script...
if (!module.parent) {
    let services = new Services();
    services.start();
}
