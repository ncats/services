const {Utils}  = require('../api');
const _ = require('lodash');
const path = require('path');

export interface LoopbackApi{
    name:string;
    app:unknown;
    config:any;
}
export class LoopbackLoader {

    private mainDir: string;
    private config: any;
    private apis: LoopbackApi[];

    constructor(config: any) {
        this.mainDir = config?.services?.main || process.cwd();
        this.apis = [];
        this.config = config;
    }

    /**
     * gets the Api settings from the config file
     * @return {config}
     */
    public getApiSettings(config:any, api: LoopbackApi) {
        if (!_.has(config, api)) {
            throw new Error(`Api ${api} has no configuration defined.`);
        }
        return _.get(config, api);
    }
    /**
     * loads all the loopback apis from the package dependency
     * @param {location}
     * @return {apis}
     */
    public loadApis():LoopbackApi[] {
        this.apis = [];
        const manifest = Utils.getPackageManifest(this.mainDir);
        const dependecies = Utils.getPackageDependencies(manifest);
        const lbApis = [];

        for (const dependency of dependecies) {
            if (_.isObject(dependency) && dependency.isLoopBackApp) {
                lbApis.push(dependency);
            }
        }
        for (const api of lbApis) {
            const apiConfig = this.getApiSettings(this.config, api.configAlias || api.name);
            if (api.package) {
                // should look inside the node_modules folder
                const module = require(path.join(this.mainDir ,'node_modules' , api.package));
                this.apis.push({ name: api.name, app: new module.app(this.config), config: apiConfig });

            } else {
                const module = require(path.join(this.mainDir, './'));
                this.apis.push({ name: api.name, app: new module.app(this.config), config: apiConfig });
            }
        }
        return this.apis;
    }
    /**
     * gets all the apis after being loaded
     * @return {apis}
     */
    public getApis():LoopbackApi[] {
        return this.apis;
    }
}
