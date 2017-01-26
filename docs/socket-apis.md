## Socket APIs

### How to add new Socket.io connections

To define socket APIs, create CommonJS modules inside the `api` directory of
your project that export a `sockets` property.  The `sockets` value is an array of socket connection handler objects each
containing the following properties:

| Name | Type | Description |
| ---- | ---- | ----------- |
| event | String | The name of the LabShare package's socket event. |
| onEvent | Function | The main event handler for the specified event. It receives `{socket, socketHandler, io, message}`, and a callback function. |
| [middleware] | Array or Function | One or more connect-style middleware functions. Each middleware receives an object containing `{socket, socketHandler, io, message}`, and a callback function. Optional. |

Objects received by Socket middleware and onEvent functions:
| Name | Type | Description |
| ---- | ---- | ----------- |
| socket | Object | The connected Socket.IO socket instance. |
| socketHandler | Object | The socket definition storing the middleware. |
| io | Object | The root Socket.IO instance. |
| message | Object | The message sent to the `onEvent` handler. Optional. |

Example:

```javascript
// ls-email/api/email.js
exports.sockets [
    {
        event: 'send-email',
        onEvent: ({socket, message}, callback) => {
            callback(null, 'Received!');
        },
        middleware: [
            ({socket, socketHandler, message}, next) => {
                if (~message.address.indexOf('spam')) {
                    next({message: 'Blocked!'});
                    return;
                }
                next();
            }
        ]
    }
];
```

### Configuring services for P2P socket communication

The `Services` package has a configuration value for establishing socket
communication between other LabShare packages using `Services`. In other words, `Services` can act as both a server and a client using sockets. Add the host names and the Socket.IO
package namespaces to the list of socket connections in `Socket.Connections`:

Example:

```json
// config.json
{
 "services": {
    "Socket": {
        "Connections": [
            "http://host1.org/namespace1",
            "http://host2.org/namespace2"
        ]
    }
 }
}
```

With the above configuration, `services` will attempt to establish a socket
connection to `host1` and `host2`. Broadcasting an event
from your LabShare package would invoke the listeners set up in the socket handlers for `host1` and `host2`.
