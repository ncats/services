const express = require('express');
const _ = require('lodash');
const lib = require('../utils');
const serverUtils = require('../server-utils');
const crypto = require('crypto');
class LbBuilder {

    constructor(labShareRC, config) {
        this.labShareRC = labShareRC;
        this.config = this.getDefaultConfig(config);
    }
    /**
     * Builds the apis using loopback 4
     */
    async build() {
        this.app = express();
        const lbServices = new lib.Lb(this.labShareRC, this.config);
        const lbApis = lbServices.loadAPIs();
        const { morgan, security, requestBodyParser } = this.config.rest;
        serverUtils.initializeSecurity({ security, expressApp: this.app });
        serverUtils.initializeBodyParser({ bodyParser: requestBodyParser, expressApp: this.app });
        if (morgan.enable) {
            serverUtils.initializeMorgan({ morgan: morgan, expressApp: this.app });
        }

        serverUtils.initializeCookieParser({ expressApp: this.app });

        // Set up express-session middleware
        serverUtils.initializeSessions(
            {
                sessionOptions: security.sessionOptions,
                logger: console,
                expressApp: this.app
            });

        for (const api of lbApis) {
            this.app.use(api.config.basePath || api.name, api.app.requestHandler);
            await api.app.boot();
            await api.app.start();
        }
        this.app.use(require('compression')());
        this.app.use(require('cors')());
        this.server = this.app.listen(this.config.rest.port, this.config.rest.host);
    }

    /**
     * Get's the default configuration for the loopback 4 apis
     * @param {config}
     * @return {config}
     */
    getDefaultConfig(config) {
        return _.defaultsDeep(config, {
            rest:{
                listenOnStart: false,
                port: 8000,
                host : '0.0.0.0',
                morgan: { // custom setting for services
                    enable: true,
                    format: 'dev', // combined for production
                },
                requestBodyParser: { // bodyParser option
                    json: {},
                    urlencoded: {
                        extended: true
                    }
                },
                security: { // custom setting for services
                    sessionOptions: {
                        secret: crypto.randomBytes(64).toString('hex'),
                        resave: false,
                        saveUninitialized: false,
                        name: 'sessionID',
                        cookie: {
                            httpOnly: true,
                            maxAge: 60 * 60 * 1000,      // 1 hour
                            secure: false   // only allow SSL cookies in production by default
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
            }
        });
    }
}

module.exports = LbBuilder;
