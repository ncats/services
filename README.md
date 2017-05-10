# LabShare Services

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3b8ace2fa2784cf29a19a3f2dfd3cc60)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=LabShare/services&amp;utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.com/LabShare/services.svg?token=Y1xBXqo2AsyTGxuGHcYM&branch=master)](https://travis-ci.com/LabShare/services)
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
