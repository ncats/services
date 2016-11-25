### HTTP APIs

To define new HTTP APIs, create CommonJS modules inside the 'api' directory of
your project.  Each API module must define a `Routes` or `routes`
array property which contains route objects and each route object must define
the following properties:

| Name | Type | Description |
| ---- | ---- | ----------- |
| httpMethod | String | It can be one of 'GET', 'POST', 'PUT', and 'DELETE'. |
| path | String | The relative API resource path (e.g. '/users/create'). |
| middleware | Array or Function | One or more Express JS middleware functions. You can define more than one middleware function by assigning an array of middleware functions to the middleware property.  For more information on creating Express JS middleware, visit: [Express documentation](http://expressjs.com/guide/using-middleware.html).  |

Example:

```javascript
// hello-package/api/helloworld.js
var helloworld = module.exports;
function hello(request, response, next) {
    response.send('Hello world!');
}
helloService.routes = [
    { path: '/hello', httpMethod: 'GET', middleware: hello }
]
```

After running `lsc services start` in the package's root directory, the API server will start up and being responding to the route '/hello' (e.g.
'http://localhost:8000/hello-package/hello'). The route is namespaced by the package name.

Note:
The Revealing Module Pattern can be used to define new API routes as long as the
exported function returns an object containing a `Routes` or `routes` property.

### Advanced API configuration [Optional]

If your LabShare package needs access to the underlying Express instance for
additional customization, export a 'Config' functions from your API modules.

Example:
```javascript
// ls-hello/api/helloworld.js
var helloworld = module.exports;
helloService.Config = function (data) {
    // - add middleware to the expressApp
    // - add global routes
    // - etc.
}
```

By default, the config function will be called with an object containing the following properties:

| Name | Type | Description |
| ---- | ---- | ----------- |
| express | Object | The ExpressJS library |
| apiLoader | Object | A ApiLoader instance. It contains methods for assigning APIs and running global API config functions. |
| services | Object | A `Services` class instance. It contains methods related to loading and starting API services. |
| app | Object | The Express router instance used by the `Services` class. |

The instantiated `services` contains the following public properties:

| Name | Type | Description |
| ---- | ---- | ----------- |
| isSiteActive | Function | Returns true after `services.expressStatic` is called. |
| start | Function | Starts all the API routes and Socket connections. |
| io | Function | Returns an instance of `Socket.IO` |
| app | Object | The Express app instance |
