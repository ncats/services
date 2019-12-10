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
     * Builds the apis using loopback
     */
    async build() {
        this.app = express();
        const lbServices = new lib.Lb(this.labShareRC, this.config);
        const lbApis = lbServices.loadAPIs();
        const { morgan, security, bodyParser } = this.config.services;
        serverUtils.initializeSecurity({ security, expressApp: this.app });
        serverUtils.initializeBodyParser({ bodyParser: bodyParser, expressApp: this.app });
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
        }
        this.app.use(require('compression')());
        this.app.use(require('cors')());
        this.server = this.app.listen(this.config.rest.port, this.config.rest.host);
    }

    /**
     * Get's the default configurtion for the lb apis
     * @param {config}
     * @return {config}
     */
    getDefaultConfig(config) {
        return _.defaultsDeep(config, {
            services: {
                morgan: {
                    enable: true,
                    format: 'dev', // combined for production
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
