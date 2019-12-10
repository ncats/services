### HTTP APIs

To define new HTTP APIs, create CommonJS modules inside the 'api' directory of
your project.  Each API module must define a `Routes` or `routes`
array property which contains route objects and each route object must define
the following properties:

| Name | Type | Description |
| ---- | ---- | ----------- |
| httpMethod | String or Array | One or more of the HTTP methods described here: [methods](http://expressjs.com/en/api.html#app.METHOD). |
| path | String | The relative API resource path (e.g. '/users/create'). |
| middleware | Array or Function | One or more Express JS middleware functions. For more information on creating Express.js middleware, visit: [Express.js documentation](http://expressjs.com/guide/using-middleware.html).  |

Example:

```javascript
// hello-package/api/helloworld.js
function hello(req, res, next) {
    res.send('Hello world!');
}

function bye(req, res, next) {
    res.send('Bye');
}

exports.routes = [
    { path: '/hello', httpMethod: 'GET', middleware: hello },
    { path: '/bye', httpMethod: ['OPTIONS', 'POST'], middleware: bye}
]
```

After running `lsc services start` in the package's root directory, the API server will start up and being responding to the route '/hello' (e.g.
'http://localhost:8000/hello-package/hello'). The route is namespaced by the package name.

Note:
The Revealing Module Pattern can be used to define new API routes as long as the
exported function returns an object containing a `Routes` or `routes` property.

### Advanced API configuration [Optional]

If your LabShare package needs access to the underlying Express instance for
additional customization, export a `config` function from your API modules.

Example:
```javascript
// ls-hello/api/helloworld.js
exports.config = function (data) {
    // - add middleware to the expressApp
    // - add global routes
    // - etc.
}
```

By default, the config function will be called with an object containing the following properties:

| Name | Type | Description |
| ---- | ---- | ----------- |
| apiLoader | Object | A ApiLoader instance. It contains methods for assigning APIs and running global API config functions. |
| app | Object | The Express router instance used by the LabShare `Services` class. |


#### Security HTTP headers 
Services API runner uses `helmet` package to set security HTTP headers. `helmet` provides some default setttings. To customize these settings you need to add or edit `services.security` element in the config file. For example: 

```json
{
 	"services": {
		"security": {
			"hsts": {
				"maxAge": 31536000
			},
			"sessionOptions": {
				"cookie": {
					"httpOnly": true,
					"maxAge": 31536000,
					"secure": false
				}
			}
		}
	}
}
```

See helmet [documentation](https://helmetjs.github.io/docs/) for further information. 


