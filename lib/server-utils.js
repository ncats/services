'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const _ = require('lodash');
const stoppable = require('stoppable');
const   connectRedis = require('connect-redis');
const memoryStore = require('memorystore');
const session = require('express-session');
const bodyParserMiddleware = require('body-parser');
const cookieParser = require('cookie-parser');
const morganMiddleware = require('morgan');
const helmet = require('helmet');
module.exports = {
    /**
     *
     * @param {object} expressApp
     * @returns {http.Server|https.Server}
     */
    createServer(expressApp) {
        // TODO: access config using @labshare/lsc ConfigLoader instead a global
        let httpsConfig = _.get(global.LabShare, 'Config.services.HTTPS', {});
        let isHTTPS = httpsConfig.certificate && httpsConfig.privateKey;
        let server;

        // Use HTTPS when certificates are available
        if (isHTTPS) {
            let credentials = {
                key: fs.readFileSync(httpsConfig.privateKey),
                cert: fs.readFileSync(httpsConfig.certificate)
            };

            server = https.createServer(credentials, expressApp);
        } else {
            server = http.createServer(expressApp);
        }

        return server;
    },
    /**
     * @description Starts Express.js HTTP server
     * @param {object} server
     * @param {object} logger
     * @param {number} port
     */
    startServer({server, logger, port}) {
        // Use 'process.env.PORT' if it is set by iisnode or a local '.env' file, etc.
        let httpPort = process.env.PORT || port;
        let serverShutdown;

        server.listen(httpPort, () => {
            let host = server.address().address,
                port = server.address().port,
                protocol = 'http';

            logger.info(`LabShare services listening at ${protocol}://${host}:${port}`);
        });
        serverShutdown = stoppable(server,0);

        server.on('error', error => {
            logger.error(error.message);
        });

        process.on('SIGTERM', () => {
            serverShutdown.stop(() =>  logger.info('LabShare services shutdown gracefully'));
        });
    },


    initializeSessions({sessionOptions , logger:console ,expressApp}) {
        let SessionStore;

        // See: https://github.com/expressjs/session#cookiesecure
        if (sessionOptions.cookie.secure) {
            logger.info('Enabling "trust proxy" since HTTPS reverse proxy is likely enabled. See https://expressjs.com/en/guide/behind-proxies.html for details.');
            expressApp.set('trust proxy', 1);
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

        expressApp.use(session(sessionOptions));
    },

    initializeSecurity({security ,expressApp}) {
        expressApp.use(helmet(security));
    },
    initializeBodyParser({bodyParser ,expressApp}) {
        expressApp.use(bodyParserMiddleware.json(bodyParser.json));
        expressApp.use(bodyParserMiddleware.urlencoded(bodyParser.urlencoded));
    },

    initializeMorgan({morgan ,expressApp}) {
        expressApp.use(morganMiddleware(morgan.format, morgan.options));
    },

    initializeCookieParser({expressApp}) {
        expressApp.use(cookieParser());
    }
};
