## Configuration

Default configuration: [sample-config.json](../sample-config.json)

### listen

Allows customization of the `port` and `hostname` options in [http server documentation](https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback).

Default:
```json
{
    "listen": {
        "port": 8000,
        "url": "http://localhost"
    }
}
```

### restApiRoot

The `restApiRoot` is the root mount point the HTTP APIs will be set on. Default: '/'.

Example:
```json
"restApiRoot": "/_api"
```

### auth

The `auth` properties defines options for interacting with LabShare Auth

|  Property   | Type | Description |
| ------------- | ------------- | ------------- |
| tenant   | string | The LabShare Auth Tenant the Resource Server (API) is registered to. Examples: `ls`, `ncats`.                                                                                                                                                                                                                    |
| url  | string | The full URL to the LabShare Auth API the Resource Server (API) is registered to. Example: `https://a.labshare.org`                                                                                                                                                                                       |
| clientId  | string | Id of the Auth client application to be used for authentication. Example: `ls-default-ng-app`                                        
| audience | string | The audience of the Resource Server. This is a unique identifier for the API registered on the LabShare Auth Service. It does not need match an actual API deployment host. This is required to check if a Client (application) is allowed to access the API. Optional. Example: `https://my.api.com/v2`. |
| setUserInfo | boolean  | When set to true, gets information about currently logged in user and add puts it into  *`request.userInfo`* variable. Optional. Example: `true`. |

### mountPoints

Optional. 
Ann array of `strings` which specifies mount points (relative to restApiRoot) on which API routes will be mounted. 
By default all API routes are mounted directly under `restApiRoot` (Example: http://localhoost:8000/apiRoot/projects).
If multiple mount points are specified then API routes will be mounted on ALL specified mount points.
Foe example if mountPoints: ['', '/point1'], then TWO `/projects` routes will be created: `http://localhoost:8000/apiRoot/projects` and
`http://localhoost:8000/apiRoot/point1/projects`. 
Express.js path parameters can also be used. For example mountPoints: ['', '/:facilityId'].     

It is recommended not to use `mountPoints` unless it is required for backward compatibility of the legacy UI applications, which may expect same routes to be exposed on different mount points.

After establishing a connection, events can be broadcast to the connections using the `io` instance exposed by `LabShare Services`.

### bodyParser

The `bodyParser` property allows options to be passed to the Express.js bodyParser.

Example:
```json
"bodyParser": {
  "json": {},
  "urlencoded": {
    "extended": true
  }
}
```

### Notifications

the `notifications` specifies options to bbe used for sending notifications. Currently Email nad SMS notifications are supported.

Example
```json5
    "notifications": {
      "email": {
        "type": "smtp",
        "settings": {
          "host": "mailfwd.nih.gov",
          "port": 25,
          "secure": false,
          "tls": {
            "rejectUnauthorized": false
          }
        }
      },
      "sms": {
        "settings": { // Twillio settings 
          "accountSid": "...", 
          "authToken": "...",
          "defaultTelephoneNumber": "+12021234567"
        }
      }
    }
```



### Security

The configuration options in `security` allow you to add or modify `LabShare Service`'s default security headers, CORS settings, session cookies, and so on.

#### sessionOptions

The `sessionOptions` object corresponds to the options used by [express-session](https://www.npmjs.com/package/express-session#options).

Default:
```json
"security": {
    "sessionOptions": {
        "secret": "",
        "cookie": {
          "httpOnly": true,
          "maxAge": 3600000,
          "secure": false
        },
        "store": null,
        "storeOptions": {}
    }
}
```

By default, the sessions will use the `MemoryStore` from `express-session`. To use `connect-redis` instead, specify `store` as
`connect-redis` and pass options to `connect-redis` using `sessionOptions.storeOptions`.

Example:
```json
"security": {
    "sessionOptions": {
        "store": "connect-redis",
        "storeOptions": {
            // https://github.com/tj/connect-redis#options
        }
    }
}
```

You can also pass a constructor in the `store` option from https://github.com/expressjs/session#compatible-session-stores.

#### Additional

The `security` object can also contain directives for several other security libraries. For a complete list, visit [helmet](https://www.npmjs.com/package/helmet#how-it-works) and [helmet docs](https://helmetjs.github.io/docs/).

Default:
```json
"security": {
    "contentSecurityPolicy": false,
    "hpkp": false,
    "referrerPolicy": {
        "policy": "no-referrer"
    }
}
```

#### Elastic Application Performance Monitoring (APM)

Configuration of the Elastic APM Node.js agent to connect to the APM server is controlled via environment variables. These variables are optional if Elastic APM is not needed.

| Environment Variable   | Value |
| ------------- | ------------- |
| ELASTIC_APM_SERVICE_NAME  | Default value is pulled from `name` field in package.json. Will need to be overridden for `@labshare` packages. |
| ELASTIC_APM_SERVER_URL  | Url of Elastic APM server.  |
| ELASTIC_APM_SECRET_TOKEN  | (Optional) Secret token for Elastic APM server. |
