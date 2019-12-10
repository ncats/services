const {cosmiconfig , cosmiconfigSync} = require("cosmiconfig");
const schemas = require('../schemas');
const _ = require("lodash");
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, jsonPointers: true });
const constants = require('../common/constants');
require('ajv-errors')(ajv);
class LabShareConfig {

 /**
  * Loads the configuration from the .labsharerc file
  * @return {labShareConfig}
  */
    static loadLabShareConfig() {
        const explorer = cosmiconfigSync(constants.LABSHARE_CONFIG);
        const result = explorer.search();
        if (_.isNil(result)) {
            return {};
        }
        const { config } = result;
        this.validateConfiguration(config);
        this.labShareConfig = config;
        return this.labShareConfig;
    }
 /**
  * gets the configuration from the .labsharerc file
  * @return {labShareConfig}
  */
    static getLabShareConfig() {
        if (_.isNil(this.labShareConfig)) {
            return this.loadLabShareConfig();
        }
        return this.labShareConfig;

    }

 /**
  * validates the configuration
  * @param {config}
  */
    static validateConfiguration(config) {
        const valid = ajv.validate(schemas.configSchema, config);
        if (!valid) {
            throw new Error(`${constants.LABSHARE_CONFIG} configuration is invalid:\n${ajv.errorsText(ajv.errors)}`);
        }
    }



}


module.exports = LabShareConfig;