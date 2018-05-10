# LabShare Services

[![Greenkeeper badge](https://badges.greenkeeper.io/LabShare/services.svg)](https://greenkeeper.io/)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3b8ace2fa2784cf29a19a3f2dfd3cc60)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=LabShare/services&amp;utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.com/LabShare/services.svg?token=zsifsALL6Np5avzzjVp1&branch=master)](https://travis-ci.com/LabShare/services)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/3b8ace2fa2784cf29a19a3f2dfd3cc60)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=LabShare/services&utm_campaign=Badge_Coverage)

## Usage

`npm i @labshare/services`

```js
const {Services} = require('@labshare/services');

let options = {
    // Override default options
};

let services = new Services(options);

services.config(({app, services}) => {
   // Optionally perform additional customization of the Express app initialized by Services and the loaded routes
});

// Start up the server with all the loaded HTTP and Socket APIs
services.start();
```

## HTTP Routes

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

## Configuration

### [Configuring LabShare Services](docs/configuration.md)
### [Environment Variables](docs/env-vars.md)

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
