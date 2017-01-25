'use strict';

const path = require('path'),
    http = require('http'),
    _ = require('lodash'),
    portfinder = require('portfinder'),
    clientio = require('socket.io-client');

describe('SocketIOLoader', () => {

    let SocketIOLoader,
        socketLoader,
        port,
        packagePath,
        options,
        server,
        apiPackage1Prefix;

    beforeEach(done => {
        packagePath = './test/fixtures/main-package';
        options = {
            main: packagePath,
            directories: [path.join(packagePath, 'node_modules', 'socket-api-package1')]
        };
        apiPackage1Prefix = '/socket-api-package-1-namespace';

        SocketIOLoader = require('../../../../lib/api/socket-io-loader');

        portfinder.getPort((err, unusedPort) => {
            if (err) {
                done.fail(err);
                return;
            }

            port = unusedPort;
            server = http.createServer().listen(unusedPort);
            socketLoader = new SocketIOLoader(server, options);

            done();
        });
    });

    afterEach(done => {
        server.close(done);
    });

    it('throws an exception when invalid arguments and/or options are provided', () => {
        expect(function () {
            new SocketIOLoader(null, {});
        }).toThrowError('SocketIOLoader: `server` is required');
        expect(function () {
            new SocketIOLoader({}, {
                main: [123]
            });
        }).toThrowError('SocketIOLoader: `options.main` must be a string');
        expect(function () {
            new SocketIOLoader({}, {
                directories: ['a/directory', 5]
            });
        }).toThrowError('SocketIOLoader: `options.directories` must contain non-empty strings');
    });

    it('does not throw if options are not provided', () => {
        expect(function () {
            new SocketIOLoader({});
        }).not.toThrow();
    });

    describe('when assigning socket IO events', () => {

        let port1,
            port2,
            server1,
            server2;

        beforeEach(done => {
            portfinder.getPort((err, unusedPort) => {
                if (err) {
                    done.fail(err);
                    return;
                }

                port1 = unusedPort;
                server1 = http.createServer().listen(unusedPort);

                portfinder.getPort((err, unusedPort) => {
                    if (err) {
                        done.fail(err);
                        return;
                    }

                    port2 = unusedPort;
                    server2 = http.createServer().listen(unusedPort);

                    done();
                });
            });
        });

        afterEach(done => {
            server1.close(() => {
                server2.close(done);
            });
        });

        it('establishes socket connections for all packages', done => {
            socketLoader.connect();

            let clientSocket = clientio.connect(`http://localhost:${port}${apiPackage1Prefix}`);

            clientSocket.once('connect', (data) => {
                clientSocket.emit('process-something', 'Data', (error, result) => {
                    expect(error).toBeNull();
                    expect(result).toBe('data');

                    clientSocket.disconnect();
                    done();
                });
            });
        });

        it('applies optional middleware to sockets', done => {
            socketLoader.connect();

            let clientSocket = clientio.connect(`http://localhost:${port}${apiPackage1Prefix}`);

            clientSocket.emit('send-email', error => {
                expect(error.message).toBe('No email provided!');

                clientSocket.emit('send-email', {address: 'legit@gmail.com'}, (error, result) => {
                    expect(error).toBeNull();
                    expect(result).toBe('Received!');

                    clientSocket.emit('send-email', {address: 'spam@nefarious.com'}, (error, result) => {
                        expect(error).not.toBeNull();
                        expect(error.message).toBe('Blocked!');
                        expect(result).toBeUndefined();

                        clientSocket.disconnect();
                        done();
                    });
                });
            });
        });

        it('establishes P2P client connections too', done => {
            let socketLoader1 = new SocketIOLoader(server1, {
                main: packagePath
            });

            socketLoader1.connect();

            let socketLoader2 = new SocketIOLoader(server2, {
                main: packagePath,
                connections: [`http://localhost:${port1}${apiPackage1Prefix}`]
            });

            socketLoader2.connect();

            socketLoader2.on('status', message => {
                if (_.includes(message, 'connected to')) {
                    expect(message).toContain(`connected to: http://localhost:${port1}`);

                    socketLoader1.disconnect();
                    socketLoader2.disconnect();

                    done();
                }
            });
        });

        it('can limit access to specific domains', done => {
            let socketLoader1 = new SocketIOLoader(server1, {
                main: packagePath,
                ioOptions: {
                    origins: 'http://some.madeup.domain:80'
                }
            });

            socketLoader1.connect();

            let socketLoader2 = new SocketIOLoader(server2, {
                main: packagePath,
                connections: [`http://localhost:${port1}${apiPackage1Prefix}`],
            });

            socketLoader2.connect();

            socketLoader2.on('error', message => {
                expect(message).toContain(`failed to connect to: http://localhost:${port1}${apiPackage1Prefix}`);
                done();
            });
        });

    });

});
