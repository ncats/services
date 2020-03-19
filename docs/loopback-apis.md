## Loopback APIs

For adding loopback apis you can use the `packageDependencies` section at the the `lsc` property or the `packageDependencies` section that is defined at 
the `package.json` file.

```json
// inside the lsc section
{
    "name": "loopback-app-package",
    "version": "0.0.1",
    "main": "index.js",
    "lsc":{
    "loopbackApi":{
        "name":"test-api"
    },
    "packageDependencies": {
        "loopback-api-package-1": {"name":"loopback-api", 
            "basePath":"/loopback" , 
            "isLoopbackApi":true}
    }
    },
   
    "dependencies": {
      "uuid": "^3.3.2"
    }
  }
  

```


```json
// outside the lsc section
{
    "name": "loopback-app-package",
    "version": "0.0.1",
    "main": "index.js",
    "lsc":{
    "loopbackApi":{
        "name":"test-api"
    }
    },
      "packageDependencies": {
        "loopback-api-package-1": {"name":"loopback-api", 
            "basePath":"/loopback" , 
            "isLoopbackApi":true}
    }
   
    "dependencies": {
      "uuid": "^3.3.2"
    }
  }
  

```

If your current project is a loopback api, you must set the following configuration at `lsc` section

```json
 "lsc":{
    "loopbackApi":{
        "name":"test-api", // name of the application
        "basePath" :"/test", //basePath - optional
        "configAlias" :"test", //allows to get specific api values from the `configAlias` section, the basePath can be defined here. - optional,
        "apiPath" : "./file" // allows to use another js file instead of index.js that it is exporting the loopback app. - optional
    }
```
```json
{
    "test":{
        "basePath":"/test"
    }
}
```
The API must use an index.js exporting an app property. This property will contain the app:

```js
//index.js
class App{
    constructor(){
    }
}

module.exports={
    app:App // the property should be app
}

```
## External APIs

If you want to load external loopback APIs , you can use the `packageDependecies` as an object format and do the following: 

```json
    "packageDependencies": {
        "loopback-api-package-1": { // module name 
            "name":"loopback-api",  // name of the api - required
            "basePath":"/loopback" , // basePath from the api - optional
            "configAlias" :"test", //allows to get specific api values from the `configAlias` section, the basePath can be defined here. - optional,
            "isLoopbackApi":true}  // indicates if is a Loopback API - required
    }
    },
```

The external API must use an index.js exporting an app property. This property will contain the app:

```js
//index.js
class App{
    constructor(){
    }
}

module.exports={
    app:App // the property should be app
}

```

from a ts file
```ts
// this file will be converted as index.ts at the dist folder
import {LoggingApi} from './application';
import {ExpressServer} from './server';
require('dotenv').config();
const config = require('config');

const app = LoggingApi;
export {app};

export async function main() {
  const server = new ExpressServer(config);
  await server.boot();
  await server.start();
  console.log(`Server is running at http://127.0.0.1:${config.rest.port}${config.logging.basePath}`);
}

```

```js
//index.js
// reading from the transpile index.ts file at the dist folder
const application = require('./dist');
module.exports = application;
```
