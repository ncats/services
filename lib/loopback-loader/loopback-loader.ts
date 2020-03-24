const { Utils } = require('../api');
const _ = require('lodash');
const path = require('path');
/* loopback api boot structure */
export interface LoopbackApi {
    name: string;
    app?: any;
    config?: any;
    configAlias?: string | undefined;
    basePath?:string | undefined;
    apiPath?: string | undefined;
    package?:boolean|undefined;
}
/* loopback api settings */
export interface LoopbackApiSettings {
    name: string;
    configAlias?: string | undefined;
    apiPath?: string | undefined;
    basePath?:string | undefined;
    module?:any | undefined;
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
     * loads all the loopback apis from the package dependency
     * @param {location}
     * @return {apis}
     */
    public loadApis(): LoopbackApi[] {
        this.apis = [];
        const manifest = Utils.getPackageManifest(this.mainDir);
        const lscSettings = Utils.getPackageLscSettings(manifest);
        const dependecies = lscSettings?.packageDependencies || Utils.getPackageDependencies(manifest);
        const lbApis:LoopbackApi[] = [];
        const loopbackApiSettings: LoopbackApiSettings = lscSettings?.loopbackApi;
        /* if the local project has an api */
        if (loopbackApiSettings) {
            lbApis.push({
                name: loopbackApiSettings.name,
                configAlias: loopbackApiSettings?.configAlias
            });
        }
        /* search for loopback Apis at packageDependencies */
        for (const dependency of dependecies) {
            if (_.isObject(dependency) && dependency.value.isLoopbackApi) {
                lbApis.push({...dependency.value , package: dependency.key});
            }
        }
        /* boot the applications */
        for (const api of lbApis) {
            if (api.package) {
                this.apis.push(this.setApiFormat(api, require(path.join(this.mainDir, 'node_modules', api.package)) ));
            } else {
                this.apis.push(this.setApiFormat(api, require(path.join(this.mainDir, api.apiPath || './')) ));
            }
        }
        return this.apis;
    }
    /**
     * gets all the apis after being loaded
     * @return {apis}
     */
    public getApis(): LoopbackApi[] {
        return this.apis;
    }
    public setApiFormat(api:LoopbackApi , module:any ){
        const apiConfig = _.get(this.config, api.configAlias || api.name);
        let basePath:string = api.basePath || apiConfig?.basePath || api.name;
        basePath =  basePath.startsWith('/')?basePath: `/${basePath}`;
        return { name: api.name, app: new module.app(this.config),basePath };
    }
}
