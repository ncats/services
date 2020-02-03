import {Application, Component, CoreBindings, inject} from '@loopback/core';
import * as glob from 'glob';
import * as path from 'path';
import * as _ from 'lodash';
import {RestBindings, RouterSpec} from '@loopback/rest';
import {PathObject, PathsObject, ParameterObject, ParameterLocation} from '@loopback/openapi-v3';
import {Request, Response, NextFunction} from 'express';
import {OAI3Keys} from '@loopback/openapi-v3/dist/keys';
import {Injection, MetadataInspector} from '@loopback/context';
import {MetadataAccessor, MetadataMap} from '@loopback/metadata';
import * as async from 'async';
import * as util from 'util';
import * as resolve from 'resolve-pkg';
import * as VError from 'verror';
import {createVersionsController} from './versions.controller';

const servicesAuth = require('@labshare/services-auth');

const METHODS_KEY = MetadataAccessor.create<Injection, MethodDecorator>('inject:methods');
const PATH_PARAMS_REGEX = /[\/?]:(.*?)(?![^\/])/g;

export class LegacyLoaderComponent implements Component {

  authUrl: string;
  authTenant: string;
  authAudience: string;
  packageManifests: any[] = [];
  mainDir: string;
  apiFilePattern: string;

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private application: Application) {
    const config = this.application.options;
    this.mainDir = _.get(config, 'services.main', process.cwd());
    this.apiFilePattern = _.get(config, 'services.pattern', '{src/api,api}/*.js');
    this.authTenant = _.get(config, 'services.auth.tenant') || _.get(config, 'services.auth.organization') || 'ls';
    this.authUrl = _.get(config, 'facility.shell.Auth.Url') || _.get(config, 'auth.url') || 'https://a.labshare.org/_api';
    this.authAudience = _.get(config, 'services.auth.audience') || 'ls-api';
    const manifest = getPackageManifest(this.mainDir);
    this.packageManifests.push(manifest);
    const packageDependencies = getPackageDependencies(manifest);

    // mount legacy API routes from the current module
    this.mountLegacyApiDirectory(this.application, this.mainDir);

    // mount legacy API routes from package dependencies
    for (const dependency of packageDependencies) {
      const dependencyPath = resolve(dependency, {cwd: this.mainDir});
      if (!dependencyPath) {
        throw new Error(`Dependency: "${dependency}" required by "${this.mainDir}" could not be found. Is it installed?`);
      }
      this.mountLegacyApiDirectory(this.application, dependencyPath);
    }
    // add controller for package versions
    const versionsController = createVersionsController(this.packageManifests);
    this.application.controller(versionsController);
  }

  private mountLegacyApiDirectory(application: Application, directory: string) {
    const serviceModulePaths = glob.sync(this.apiFilePattern, {cwd: directory}).map(file => {
      return path.resolve(directory, file);
    });

    const manifest = getPackageManifest(directory);
    if (!manifest) {
      return;
    }
    this.packageManifests.push(manifest);
    const packageName = getPackageName(manifest);

    const serviceRoutes = getServiceRoutes(serviceModulePaths);
    this.applyAuthMiddleware(serviceRoutes);

    // loop over discovered api modules
    for (const service in serviceRoutes) {
      const routes = serviceRoutes[service];
      const controllerClassName = `${service}Controller`;
      const middlewareFunctions: any = {}; // an key-value object with keys being route handler names and values the handler function themselves
      const pathsSpecs: PathsObject = {}; // LB4 object to add to class to specify route / handler mapping
      // loop over routes defined in the module
      for (const route of routes) {
        try {
          const httpMethods = _.isArray(route.httpMethod) ? route.httpMethod : [route.httpMethod];
          for (const httpMethod of httpMethods) {
            const handlerName =
              httpMethod.toLowerCase() +
              route.path
                .replace(/\/:/g, '_')
                .replace(/\//g, '_')
                .replace(/-/g, '_')
                .replace('?', '');
            middlewareFunctions[handlerName] = route.middleware;
            if (packageName === 'facility') {
              route.path = `/:facilityId/${packageName}${route.path}`;
            } else {
              route.path = `/${packageName}${route.path}`;
            }
            appendPath(pathsSpecs, route, controllerClassName, handlerName);
          }
        } catch (err) {
          throw new VError(err, `Error loading route ${JSON.stringify(route.httpMethod)} : ${route.path}.`);
        }
      }
      try {
        const controllerSpecs: RouterSpec = {paths: pathsSpecs};
        const controllerClassDefinition = getControllerClassDefinition(controllerClassName, Object.keys(middlewareFunctions));
        const defineNewController = new Function('middlewareRunner', 'middlewareFunctions', controllerClassDefinition);
        const controllerClass = defineNewController(middlewareRunnerPromise, middlewareFunctions);

        // Add metadata for mapping HTTP routes to controller class functions
        MetadataInspector.defineMetadata(OAI3Keys.CONTROLLER_SPEC_KEY.key, controllerSpecs, controllerClass);

        const injectionSpecs = getControllerInjectionSpecs(controllerClass);
        // Add metadata for injecting HTTP Request and Response objects into controller class
        MetadataInspector.defineMetadata<MetadataMap<Readonly<Injection>[]>>(METHODS_KEY, injectionSpecs, controllerClass);

        // add controller to the LB4 application
        application.controller(controllerClass);
      }
      catch (err) {
        throw new VError(err, `Error registering module ${service} as LoopBack controller.`);
      }
    }
  }

  private applyAuthMiddleware(serviceRoutes: any) {
    const auth = servicesAuth({authUrl: this.authUrl, tenant: this.authTenant, audience: this.authAudience});
    auth({services: serviceRoutes});
  }
}

/**
 * Runs middleware function or a collection of functions
 * @param middleware middleware which can be either a single function or an array of functions
 * @param req HTTP request object
 * @param res HTTP response object
 * @param cb callback function
 */
function middlewareRunner(middleware: any, req: Request, res: Response, cb: NextFunction) {
  // apply request and response arguments to each middleware function and run them in sequence
  async.applyEachSeries(middleware, req, res, cb);
}

const middlewareRunnerPromise = util.promisify(middlewareRunner);

function getServiceRoutes(serviceModulePaths: string[]) {
  return _.reduce(
    serviceModulePaths,
    (result, value, key) => {
      const module = require(value);
      const routes = getRoutes(module);
      if (_.isEmpty(routes)) {
        return result;
      }
      let serviceName;
      if (!_.isFunction(module.constructor)) {
        serviceName = module.constructor.name;
      } else {
        const matches = value.match(/[^\\\/]+(?=\.[\w]+$)|[^\\\/]+$/);
        if (!matches) {
          throw new Error(`Could not determine service name for module ${value}.`);
        }
        serviceName = _.capitalize(matches[0]);
      }
      result[serviceName] = routes;
      return result;
    },
    {} as any
  );
}

/**
 * @description Retrieves the list of routes from the given module.
 * @param {Module} serviceModule - A NodeJS module that defines routes
 * @returns {Array} - A list of route objects or an empty array
 * @private
 */
function getRoutes(serviceModule: any): LegacyRoute[] {
  if (_.isFunction(serviceModule)) {
    // support revealing module pattern
    serviceModule = serviceModule();
  }

  const routes = serviceModule.Routes || serviceModule.routes || [];

  // Ensure modifications of the route properties do not mutate the original module
  const routesCopy = _.cloneDeep(routes);
  // Ensure that all middleware is an array rather than a function
  for (const route of routesCopy) {
    if (_.isFunction(route.middleware)) {
      route.middleware = [route.middleware];
    }
  }
  return routesCopy;
}

/**
 * Returns a string with controller class definition
 * @param controllerClassName - a name to be given to controller class
 * @param handlerNames - handler function name
 */
function getControllerClassDefinition(controllerClassName: string, handlerNames: string[]): string {
  let handlers = '';
  for (const handlerName of handlerNames) {
    handlers =
      handlers +
      `async ${handlerName}() {return await middlewareRunner(middlewareFunctions['${handlerName}'], this.request, this.response);}\n`;
  }
  return `return class ${controllerClassName} {
    constructor(request, response) {
       this.request = request;
       this.response = response;
    };
    
    ${handlers}      
  }`;
}

/**
 * Appends a new LB4 PathObject to PathObjects collection
 * @param pathsObject - LB4 PathObjects collection to append new item to
 * @param route - HTTP route for new PathObject
 * @param controllerName - controller class name
 * @param handlerName - handler function name to map HTTP route to
 */
function appendPath(pathsObject: PathsObject, route: LegacyRoute, controllerName: string, handlerName: string) {
  const lb4Path = route.path.replace(PATH_PARAMS_REGEX, (substring: string): string => {
    return `/{${_.trimStart(substring.replace('?', ''), '/:')}}`;
  });
  let pathObject: PathObject;
  if (!pathsObject[lb4Path]) {
    pathObject = {};
    pathsObject[lb4Path] = pathObject;
  } else {
    pathObject = pathsObject[lb4Path];
  }

  const httpMethods = _.isArray(route.httpMethod) ? route.httpMethod : [route.httpMethod];
  for (const httpMethod of httpMethods) {
    pathObject[httpMethod] = {
      responses: {},
      'x-operation-name': handlerName,
      'x-controller-name': controllerName,
      operationId: `${controllerName}.${handlerName}`
    };
    const params = getPathParams(route.path);
    if (!_.isEmpty(params)) {
      pathObject[httpMethod].parameters = params;
    }
  }
}

/**
 * Parses express.js route path and returns an array of LB4 ParameterObjects[] corresponding to found path parameters
 * @param routePath
 */
function getPathParams(routePath: string): ParameterObject[] {
  const matches = routePath.match(PATH_PARAMS_REGEX);
  return _.map(matches, match => {
    let required = true;
    if (match.endsWith('?')) {
      required = false;
    }
    return {
      name: _.trimStart(match.replace('?', ''), ':/'),
      in: 'path' as ParameterLocation,
      schema: {
        type: 'string'
      },
      required
    };
  });
}

/**
 * Returns LB4 MetadataMap to be used for injecting Request and Response objects to dynamically defined controller classes
 * @param target - controller class object
 */
function getControllerInjectionSpecs(target: Object): MetadataMap<Readonly<Injection>[]> {
  return {
    '': [
      {
        target,
        methodDescriptorOrParameterIndex: 0,
        bindingSelector: RestBindings.Http.REQUEST,
        metadata: {
          decorator: '@inject'
        }
      },
      {
        target,
        methodDescriptorOrParameterIndex: 1,
        bindingSelector: RestBindings.Http.RESPONSE,
        metadata: {
          decorator: '@inject'
        }
      }
    ]
  };
}

function getPackageManifest(directory: string) {
  const manifestPath = path.resolve(directory, 'package.json');
  const manifest = require(manifestPath);

  if (!manifest) {
    return null;
  } else if (!getPackageName(manifest)) {
    throw new Error(manifestPath + ' is missing a `name` property');
  }

  return manifest;
}

function getPackageName(manifest: any) {
  if (!manifest || !(manifest.namespace || manifest.name)) {
    return null;
  }
  return (manifest.namespace || manifest.name).toLowerCase();
}

/**
 * @param manifest - A parsed LabShare package package.json file
 * @returns {Array} A list of LabShare package dependencies or an empty array
 */
function getPackageDependencies(manifest: any) {
  const dependencies = _.get(manifest, 'packageDependencies', []);
  if (_.isArray(dependencies)) {
    return dependencies;
  }
  return Object.keys(manifest.packageDependencies);
}

interface LegacyRoute {
  path: string;
  httpMethod: string;
  middleware: (req: Request, res: Response) => {};
}
