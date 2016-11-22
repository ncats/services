## Socket.io APIs

### How to add new Socket.io connections

Create Node modules inside the 'api' directory of your package that export a
'onConnect' function. The 'onConnect' function will receive a socket at start
up as the first argument. You can assign event listeners and handlers to the
socket as needed.

Example:

```javascript
// ls-hello/api/hellosocket.js
exports.onConnect = function (socket) {
    socket.emit('connected', 'Hi there!');
    socket.on('some-awesome-event', function (excitingData) {
        // do something
    });
    // ...
}
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
from your LabShare package would invoke the listeners set up in the `onConnect`
functions of `host1` and `host2`.
