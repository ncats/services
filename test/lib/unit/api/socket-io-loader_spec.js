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
        socketLoader = new SocketIOLoader(options);

        portfinder.getPort((err, unusedPort) => {
            if (err) {
                done.fail(err);
                return;
            }

            port = unusedPort;

            server = http.createServer().listen(unusedPort);
            done();
        });
    });

    afterEach(done => {
        server.close(done);
    });

    it('throws an exception when invalid arguments and/or options are provided', () => {
        expect(function () {
            new SocketIOLoader({
                main: [123]
            });
        }).toThrowError('SocketIOLoader: `options.main` must be a string');
        expect(function () {
            new SocketIOLoader({
                directories: ['a/directory', 5]
            });
        }).toThrowError('SocketIOLoader: `options.directories` must contain non-empty strings');
    });

    it('does not throw if options are not provided', () => {
        expect(function () {
            new SocketIOLoader();
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
            socketLoader.connect(server);

            let clientSocket = clientio.connect(`http://localhost:${port}${apiPackage1Prefix}`);

            clientSocket.once('connect', (data) => {
                clientSocket.emit('process-something', 'Data', (error, data) => {
                    expect(data).toBe('data');

                    clientSocket.disconnect();
                    done();
                });
            });
        });

        it('establishes P2P client connections too', done => {
            let socketLoader1 = new SocketIOLoader({
                main: packagePath
            });

            socketLoader1.connect(server1);

            let socketLoader2 = new SocketIOLoader({
                main: packagePath,
                connections: [`http://localhost:${port1}${apiPackage1Prefix}`]
            });

            socketLoader2.connect(server2);

            socketLoader2.on('status', message => {
                if (_.includes(message, 'connected to')) {
                    expect(message).toContain(`connected to: http://localhost:${port1}`);

                    socketLoader1.disconnect();
                    socketLoader2.disconnect();

                    done();
                }
            });
        });

    });

});
