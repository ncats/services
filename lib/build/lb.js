const express = require('express');
const lib = require('../utils');
const helmet = require('helmet');
const crypto = require('crypto'),
class LbBuilder {

    constructor(labShareRC, config) {
        this.labShareRC = labShareRC;
        this.config = config;
    }
    async build() {
        this.app = express();
        const lbServices = new lib.Lb(this.labShareRC, this.config);
        const lbApis = lbServices.loadAPIs();
        // helmet
        this.app.use(helmet(this.config.services.security));
        for (const api of lbApis) {
            this.app.use(api.config.basePath || api.name, api.app.requestHandler);
            await api.app.boot();
        }
        this.server = this.app.listen(this.config.rest.port, this.config.rest.host);
    }

    defaultConfig(config) {
        this.config = _.defaultsDeep(config, {
            services: {
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
            }
        });
    }
}

module.exports = LbBuilder;
