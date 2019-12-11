[![Greenkeeper badge](https://badges.greenkeeper.io/LabShare/services.svg)](https://greenkeeper.io/)
[![Coverage Status](https://coveralls.io/repos/github/LabShare/services/badge.svg?branch=master)](https://coveralls.io/github/LabShare/services?branch=master)
[![Build Status](https://travis-ci.com/LabShare/services.svg?token=zsifsALL6Np5avzzjVp1&branch=master)](https://travis-ci.com/LabShare/services)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![codecov](https://codecov.io/gh/LabShare/services/branch/master/graph/badge.svg)](https://codecov.io/gh/LabShare/services)

# LabShare Services

## Usage

`npm i @labshare/services`

```js
const {Services} = require('@labshare/services');

let options = {
    // Override default options. 
    // The available configuration options are described in the "Configuration" section below.
};

let services = new Services(options);

services.config(({app, services}) => {
   // Optionally perform additional customization of the Express app initialized by Services and the loaded routes
   // Example (adds Express.js compression middleware):
   app.use(compression());
});

// Start up the server with all the loaded HTTP and Socket APIs
services.start();
```

### Using as CLI with Loopback 4 Architecture
`@labshare/services` is a package for loading APIs. These APIs can be single on multiple mounted over a single thread.
This package supports 2 modes:
| mode  |  reason  |
|---|---|
| services  | LabShare basic Express app with route loading architecture |
| lb | LabShare API LoopBack support architecture. |

This cli is using `@labshare/lsc` which is a cli bundler from the LabShare project , more information [here](https://github.com/labshare/lsc)

This can be defined at the .labsharerc file ( if it is not present, it will use services mode).

```sh
{
  "mode": "lb", // or services
  "apis":[{"name":"api"}] // array of loopback 4 apis 
}

```
### Configuration

| configuration  |  reason  |
|---|---|
| config.json  | services configuration file |
| config/ | configuration folder for Loopback 4 (lb) APIs |
| .labsharec  |  @labshare/services module configuration  |

#### services
LabShare API Services Architecture can load both API modes, you will need to add the config.json configuration for services APIs and the config folder for lb APIs.
The settings for starting the server will be taken from  the config.js configuration section `services.listen`
The APIs that need to be loaded should be defined as package dependencies at the package.json
  "packageDependencies": [
    "@labshare/services",
    "@labshare/facility"
  ],
Now you can start the app as lsc services start.
#### lb
LabShare API LoopBack Support Architecture will only load loopback 4 APIs.
In order to use it you will need to have the following configuration:
npm i @labshare/services  at the host project
add a .labsharerc file with the following configuration
```sh
{
  "mode": "lb",
  "apis":[{"name":"api" , package:"@labshare/facility-api" , configAlias:"facility"}]
}

```
 
Where:
| key  |  value  |
|---|---|
| mode  |  it sets the mode to lb. |
| apis  |  an array of APIs that will be loaded thru @labshare/services . |

Each of the APIs will have the following configuration:

| key  |  value  |
|---|---|
| name  |  API name - it will be the use for retrieving the API configuration.|
| package  |  npm package that will contain the API, if it is not defined it will load the host's project loopback 4 API. |
| configAlias  | if defined it will load the API configuration with the given value. |

The lb API project should have:
a config folder, this will need to have the API configuration, for example:
The following application it is called @labshare/logging-api
The configuration values are:
| key  |  value  | reason  |
|---|---|---|
| name  |  logging| it will try to look for the logging name at the configuration|
| package  |  | it will use the current project's APPI |
| configAlias  |  | it does not need to use configAlias|

```sh
module.exports = {
  rest: {
    host: process.env.API_HOST || '0.0.0.0',
    port: process.env.API_PORT || 8000,
    openApiSpec: {
      setServersFromRequest: process.env.OPEN_API_SPEC || true,
    },
  },
  ......
  logging: {
    enableLogging: process.env.ENABLE_LOGGING || true,
    basePath: process.env.LOGGING_BASE_PATH || '/api'
  }
};
```
Where 

| key  |  value  |
|---|---|
| rest  | will be the loading configuration for the apis. [Click](https://loopback.io/doc/en/lb4/Server.html#rest-options) here more information:  |
| logging  |  the api name at the configuration |
| index.ts  | main application's index file |

At the index.ts file inside src you will need to export the API application as app:

```sh
const app = LoggingApi;
export {app}; 
```

Now you can start the app as lsc services start.

#### lb Configuration:

The following are the custom configuration settings that can be added to Loopback's 4 rest settings for the services project.

```sh


            rest: {
                .... 
                morgan: { . // enable or disables morgan for logging the API
                    enable: true,
                    format: 'dev', // combined for production
                },
                requestBodyParser: { // body Parser
                    json: {},
                    urlencoded: {
                        extended: true
                    }
                },
                security: { // security and sessions management
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
```

## Configuration

### [Configuring LabShare Services](docs/configuration.md)
### [Environment Variables](docs/env-vars.md)

## LabShare Service Plugins

* [services-auth](https://www.npmjs.com/package/@labshare/services-auth): OAuth2 API authorization plugin
* [services-cache](https://www.npmjs.com/package/@labshare/services-cache): Enables Redis caching
* [services-build-cli](https://www.npmjs.com/package/@labshare/services-build-cli): Generates API distributions
* [services-msi-cli](https://www.npmjs.com/package/@labshare/services-msi-cli): Generates a Windows MSI for a Node.js API project

### Example plugin usage

```js
const {Services} = require('@labshare/services');
const servicesAuth = require('@labshare/services-auth');

const services = new Services({/* options */);

services.config(servicesAuth({/* options */}));
```

## Default HTTP Routes

### Versions

```
GET /<service-path>/versions
```

__Response__
```
{
   "buildVersion":"v2017.0914.5",
   "versions": [
       {"api":"ls", apiDetails":{"name":"labshare","version":"v0.17.0631","description":"LabShare Services"}}
   ]
}
```

Example:
http://localhost:8000/versions

### Endpoints

```
GET /<service-path>/<project-name>/endpoints
POST /<service-path>/<project-name>/endpoints
```

__Response__
```
HTML table with the HTTP routes of the provided project name.
```

Example:
http://localhost:8000/services/endpoints

## Working with LabShare APIs
### [Running APIs](docs/run-package.md)
### [Creating HTTP APIs](docs/http-apis.md)
### [Creating Socket APIs](docs/socket-apis.md)
### [Managing APIs with PM2](docs/pm2-services.md)

## Development
1. Install [Node.js](https://nodejs.org).
2. `npm i -g lsc`
3. Run `npm install` inside the Service's root directory to install its dependencies.

### Tests
`npm test`
