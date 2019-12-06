const {cosmiconfig , cosmiconfigSync} = require("cosmiconfig");
const schemas = require('../schemas');
const _ = require("lodash");
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, jsonPointers: true });
const constants = require('../common/constants');
require('ajv-errors')(ajv);
class LabShareConfig {

    static loadLabShareConfig() {
        const explorer = cosmiconfigSync(constants.LABSHARE_CONFIG);
        const result = explorer.search();
        if (_.isNil(result)) {
            throw new Error(`${constants.LABSHARE_CONFIG} is required`);
        }
        const { config } = result;
        this.setConfiguration(config);
        this.labShareConfig = config;
        return this.labShareConfig;
    }

    static getLabShareConfig() {
        if (_.isNil(this.labShareConfig)) {
            return this.loadLabShareConfig();
        }
        return this.labShareConfig;

    }

    /**
  * Get's the files and sets the
  * files from predefined routes
  * @param {Config}
  */
    static setConfiguration(config) {
        const valid = ajv.validate(schemas.configSchema, config);
        if (!valid) {
            throw new Error(`${constants.LABSHARE_CONFIG} configuration is invalid:\n${ajv.errorsText(ajv.errors)}`);
        }
    }



}


module.exports = LabShareConfig;