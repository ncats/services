
const _ = require('lodash');
const path = require('path');
const constants = require('../common/constants');

class LbHelper {
    constructor(labShareRC, config) {
        this.apis = [];
        this.labShareRC = labShareRC;
        this.config = config;
    }
    // gets the settings from the local configuration
    getApiRestSettings(config, api) {
        if (!_.has(config, api)) {
            //throw new Error(`Api ${api} has no configuration defined.`);
        }
        return _.get(config, api);
    }
    loadAPIs(location = process.cwd()) {
        this.apis = [];
        for (const api of this.labShareRC.apis || []) {
            const apiConfig = this.getApiRestSettings(this.config, api.configAlias || api.name);

            debugger;
            if (_.has(api, constants.LABSHARE_API_PACKAGE)) {
                // should look inside the node_modules folder
                const module = require(path.join(location, api.package));
                this.apis.push({ name: api.name, app: new module.app(this.config), config: apiConfig });

            } else {
                const module = require(path.join(location, './'));
                this.apis.push({ name: api.name, app: new module.app(this.config), config: apiConfig });
            }
        }
        return this.apis;
    }
    getAPIs() {
        return this.apis;
    }
}

module.exports = LbHelper;
