'use strict';

const io = require('socket.io'),
    Socket = require('./socket'),
    clientio = require('socket.io-client'),
    ss = require('socket.io-stream'),
    async = require('async'),
    path = require('path'),
    assert = require('assert'),
    {EventEmitter} = require('events'),
    _ = require('lodash'),
    apiUtils = require('./utils');

/**
 *
 * @param {String} modulePath - The path to a package API module
 * @returns {Function|null}
 * @private
 */
function getSockets(modulePath) {
    let socketModule = require(modulePath);
    if (_.isFunction(socketModule)) {
        socketModule = socketModule();
    }
    return socketModule.sockets ? _.cloneDeep(socketModule.sockets) : null;
}

/**
 * @description Process the socket connection
 * @param {Object} options
 * @param {Object} options.socketHandler
 * @param {Function} [ackCallback]
 * @api private
 */
function handler(options, ackCallback) {
    let {socketHandler} = options;

    if (_.isEmpty(socketHandler.middleware)) {
        options.socketHandler.onEvent(options, ackCallback);
        return;
    }

    let middleware = _.map(socketHandler.middleware, middleware => {
        return next => middleware(options, next);
    });

    // Pass the socket connection through each middleware and then finally call the original event handler
    async.series(middleware, err => {
        if (err) {
            ackCallback(err);
            return;
        }

        socketHandler.onEvent(options, ackCallback);
    });
}

class SocketIOLoader extends EventEmitter {

    /**
     * @param {object} server - An instance of a HTTP or HTTPS server
     * @param {object} [options]
     * @param {string} [options.main] - The path to a LabShare package to search for socket IO modules
     * @param {Array.<String>} [options.connections] - A list of URLs to connect to as a server P2P socket client.
     * @param {string|Array} [options.directories] - Additional directories to check for socket.io modules
     * @param {string} [options.pattern] - The glob pattern to use when searching for socket.io modules
     * @param {object} [options.ioOptions] - Options to pass to the socket.io constructor
     * @constructor
     */
    constructor(server, options = {}) {
        super();

        assert.ok(_.isObject(server), 'SocketIOLoader: `server` is required');

        if (options.main) {
            assert.ok(_.isString(options.main), 'SocketIOLoader: `options.main` must be a string');
            options.main = path.resolve(options.main);
        }
        if (options.directories) {
            options.directories = _.isArray(options.directories) ? options.directories : [options.directories];
            options.directories = _.map(options.directories, directory => {
                assert.ok(_.isString(directory), 'SocketIOLoader: `options.directories` must contain non-empty strings');
                return path.resolve(directory);
            });
        }

        this.options = _.defaults(options, {
            pattern: 'api/*.js',
            main: '',
            directories: [],
            socket : {
                connections: []
            }

        });

        this._clients = [];
        this._initialized = false;
        this._sockets = {};  // All the socket definitions from LabShare packages organized by package name
        this.io = io(server, options.ioOptions);
        this.io.sockets.setMaxListeners(50);  // Increase Node's default limit of 10 listeners
    }

    /**
     * @description Caches all the available socket connections defined by LabShare packages
     * @api
     */
    initialize() {
        this._initialized = true;

        if (this.options.main) {
            apiUtils.applyToNodeModulesSync(this.options.main, this._cacheSockets.bind(this));
        }

        _.each(this.options.directories, this._cacheSockets.bind(this));
    }

    /**
     * @description Set up all the package Socket.io connections
     * @api
     */
    connect() {
        if (!this._initialized) {
            this.initialize();
        }

        // Establish client connections for Node process P2P communication
        _.each(this.options.socket.connections, connection => {
            const client = clientio.connect(connection);

            _.each(this._sockets, sockets => {
                this._onConnection(sockets, client);
            });

            client.on('connect', () => {
                this.emit('status', `Socket connected to: ${connection}`);
            });
            client.on('error', (error) => {
                this.emit('error', `Socket connection ${connection} error: ${error}`);
            });
            client.on('connect_error', (error) => {
                this.emit('error', `Socket failed to connect to: ${connection}. Error description: ${error}`);
            });
            client.on('disconnect', () => {
                this.emit('status', `Disconnected socket connection: ${connection}`);
            });
            client.on('reconnect', () => {
                this.emit('status', `Reconnected socket connection: ${connection}`);
            });

            this._clients.push(client);
        });

        // Establish server socket connections and wait until the main socket connection is established before assigning namespaced connections
        this.io.on('connection', () => {
            _.each(this._sockets, (sockets, packageName) => {
                this.io
                    .of(packageName)
                    .on('connection', socket => {
                        this._onConnection(sockets, socket);
                    });

                this.io.removeAllListeners('connection');
            });
        });

        return this._clients;
    }

    /**
     * @description Disconnect all server P2P connections
     */
    disconnect() {
        this._clients.forEach(client => {
            client.destroy(true);
        });
    }

    /**
     * @api
     * @returns The initialized Socket.IO instance
     */
    getIO() {
        return this.io;
    }

    /**
     * @api
     * @returns All LabShare package socket handlers
     */
    getSockets() {
        if (!this._initialized) {
            this.initialize();
        }

        return this._sockets;
    }

    _cacheSockets(packagePath) {
        let packageName = apiUtils.getPackageName(apiUtils.getPackageManifest(packagePath));

        if (this._sockets[packageName]) {
            return;
        }

        this._sockets[packageName] = [];

        let socketIOModules = apiUtils.getMatchingFilesSync(packagePath, this.options.pattern);

        // Collect all the Node modules containing socket definitions
        _.each(socketIOModules, modulePath => {
            let socketHandlers = getSockets(modulePath);

            if (_.isEmpty(socketHandlers)) {
                return;
            }

            _.each(socketHandlers, socketOptions => {
                let socket = new Socket(packageName, socketOptions);
                this._sockets[packageName].push(socket);
            });
        });
    }

    /**
     * @description Processes socket connections and socket middleware
     * @param {array.<{Object}>} socketHandlers
     * @param {Socket} socket
     * @api private
     */
    _onConnection(socketHandlers, socket) {
        _.each(socketHandlers, socketHandler => {
            switch (socketHandler.type) {
                case 'stream':
                    // Use https://www.npmjs.com/package/socket.io-stream#usage to transform the socket and process the stream
                    ss(socket).on(socketHandler.event, (stream, message, callback) => {
                        // If the message was not provided
                        if (_.isFunction(message)) {
                            callback = message;
                            message = null;
                        }

                        if (!(stream instanceof EventEmitter)) {
                            let errorMessage = `Invalid stream passed to "${socketHandler.event}". It must be a readable/writable stream.`;

                            if (_.isFunction(callback)) {
                                callback({error: errorMessage, code: 400});
                            } else {
                                socket.emit('error', {error: errorMessage, code: 400})
                            }

                            return;
                        }

                        let options = {stream, socket, message, io: this.io, socketHandler};

                        handler(options, callback);
                    });
                    break;
                default:
                    socket.on(socketHandler.event, (message, callback) => {
                        if (_.isFunction(message)) {
                            callback = message;
                            message = null;
                        }

                        let options = {socket, message, io: this.io, socketHandler};

                        handler(options, callback);
                    });
            }
        });
    }
}

module.exports = SocketIOLoader;
