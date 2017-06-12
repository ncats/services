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

### ServicePath

The `ServicePath` is the mountpoint the HTTP APIs will be set on. Default: '/'.

Example:
```json
"ServicePath": "/_api"
```

### Socket

#### connections

The `connections` option can be used to establish P2P socket connections on start up. It defaults to an empty array.

Example:
```json
"socket": {
    "connections": [
        "http://domain1.com/users",
        "http://domain2.com/kittens"
    ]
}
```

After establishing a connection, events can be broadcast to the connections using the `io` instance exposed by `LabShare Services`.

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

#### corsOptions

The `corsOptions` object corresponds to the options used by [cors](https://www.npmjs.com/package/cors#configuration-options).

Default:
```json
"security": {
    "corsOptions": {
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false
    }
}
```

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