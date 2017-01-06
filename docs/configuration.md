## Configuration

Default configuration: [sample-config.json](../sample-config.json)

### Listen

TODO

### ServicePath

TODO

### Socket

TODO

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
        }
    }
}
```

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