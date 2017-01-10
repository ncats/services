'use strict';

const io = require('socket.io'),
    clientio = require('socket.io-client'),
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
function getConnectHandler(modulePath) {
    let socketModule = require(modulePath);
    if (_.isFunction(socketModule)) {
        socketModule = socketModule();
    }
    return socketModule.onConnect || null;
}

class SocketIOLoader extends EventEmitter {

    /**
     * @param {object} [options]
     * @param {string} [options.main] - The path to a LabShare package to search for socket IO modules
     * @param {Array.<String>} [options.connections] - A list of URLs to connect to as a server P2P socket client.
     * @param {string|Array} [options.directories] - Additional directories to check for socket.io modules
     * @param {string} [options.pattern] - The glob pattern to use when searching for socket.io modules
     * @constructor
     */
    constructor(options = {}) {
        super();

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
            connections: []
        });

        this._clients = [];
    }

    /**
     * @description Set up all the package Socket.io connections
     * @param {object|String} server - An instance of an HTTP server or a URL to the active server (Note: an Express.js request handler is not valid)
     * @api
     */
    connect(server) {
        assert.ok(_.isObject(server) || _.isString(server), 'SocketIOLoader: `server` is required');

        this.io = io(server);
        this.io.sockets.setMaxListeners(50);  // Increase Node's default limit of 10 listeners

        // Establish client connections for Node process P2P communication
        _.each(this.options.connections, connection => {
            const client = clientio.connect(connection);
            this._establishSocketConnections(this._connectPackage, client);
            client.once('connect', () => {
                this.emit('status', `Socket connected to: ${connection}`);
            });
            client.once('error', (error) => {
                this.emit('error', `Socket connection ${connection} error: ${error}`);
            });
            client.once('connect_error', (error) => {
                this.emit('error', `Socket failed to connect to: ${connection}. Error description: ${error}`);
            });
            client.once('disconnect', () => {
                this.emit('status', `Disconnected socket connection: ${connection}`);
            });
            client.once('reconnect', () => {
                this.emit('status', `Reconnected socket connection: ${connection}`);
            });

            this._clients.push(client);
        });

        // Establish server socket connections and wait until the main socket connection is established before assigning namespaced connections
        this.io.on('connection', () => {
            this._establishSocketConnections(this._establishNameSpacedConnection);
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
        if (!this.io) {
            throw new Error('SocketIOLoader: `.connect()` must be called with a valid HTTP server first!');
        }
        return this.io;
    }

    /**
     * @param {function} func - A function that will be called with a `packagePath` and any additional arguments passed to _establishSocketConnections()
     * @param {Array} additionalArgs
     * @private
     */
    _establishSocketConnections(func, ...additionalArgs) {
        let isConnected = {};

        if (this.options.main) {
            apiUtils.applyToNodeModules(this.options.main, packagePath => {
                let packageName = apiUtils.getPackageName(apiUtils.getPackageManifest(packagePath));

                // Don't duplicate the event listeners for APIs!
                if (_.get(isConnected, packageName)) {
                    return;
                }

                func.apply(this, [packagePath].concat(additionalArgs));

                isConnected[packageName] = true;
            }).catch((error) => {
                this.emit('error', error);
            });
        }

        _.each(this.options.directories, (packagePath) => {
            let packageName = apiUtils.getPackageName(apiUtils.getPackageManifest(packagePath));

            // Don't duplicate the event listeners for APIs!
            if (_.get(isConnected, packageName)) {
                return;
            }

            func.apply(this, [packagePath].concat(additionalArgs));

            isConnected[packageName] = true;
        });
    }

    /**
     *
     * @param {string} packagePath
     * @private
     */
    _establishNameSpacedConnection(packagePath) {
        let packageName = apiUtils.getPackageName(apiUtils.getPackageManifest(packagePath));

        this.io
            .of('/' + packageName)
            .on('connection', (socket) => {
                this._connectPackage(packagePath, socket);
            });
    }

    /**
     *
     * @param {string} packagePath
     * @param {object} socket
     * @private
     */
    _connectPackage(packagePath, socket) {
        let socketIOModules = apiUtils.getMatchingFilesSync(packagePath, this.options.pattern);

        _.each(socketIOModules, (modulePath) => {
            let connectHandler = getConnectHandler(modulePath);
            if (!connectHandler) {
                return;
            }

            if (!_.isFunction(connectHandler)) {
                this.emit('error', new Error(`The "onConnect" property exposed by module "${modulePath}" must be a function!`));
            } else {
                connectHandler(socket);
            }
        });
    }
}

module.exports = SocketIOLoader;
