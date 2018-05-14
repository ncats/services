'use strict';

const path = require('path'),
    http = require('http'),
    _ = require('lodash'),
    fs = require('fs'),
    portfinder = require('portfinder'),
    ss = require('socket.io-stream'),
    temp = require('temp').track(),
    clientio = require('socket.io-client'),
    readChunk = require('read-chunk'),
    isJpg = require('is-jpg'),  // used to verify binary stream result. See: https://www.npmjs.com/package/is-jpg
    SocketIOLoader = require('../../../../lib/api/socket-io-loader');

describe('SocketIOLoader', () => {

    let socketLoader,
        port,
        packagePath,
        options,
        server,
        socketApiNamespace;

    beforeEach(done => {
        packagePath = './test/fixtures/main-package';
        options = {
            main: packagePath,
            directories: [path.join(packagePath, 'node_modules', 'socket-api-package1')]
        };
        socketApiNamespace = '/socket-api-package-1-namespace';

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
        expect(() => {
            new SocketIOLoader(null, {});
        }).toThrowError('SocketIOLoader: `server` is required');
        expect(() => {
            new SocketIOLoader({}, {
                main: [123]
            });
        }).toThrowError('SocketIOLoader: `options.main` must be a string');
        expect(() => {
            new SocketIOLoader({}, {
                directories: ['a/directory', 5]
            });
        }).toThrowError('SocketIOLoader: `options.directories` must contain non-empty strings');
    });

    it('does not throw if options are not provided', () => {
        expect(() => {
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

            let clientSocket = clientio.connect(`http://localhost:${port}${socketApiNamespace}`);

            clientSocket.once('connect', () => {
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

            let clientSocket = clientio.connect(`http://localhost:${port}${socketApiNamespace}`);

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

        it('establishes P2P server connections', done => {
            let socketLoader1 = new SocketIOLoader(server1, {
                main: packagePath
            });

            socketLoader1.connect();

            let socketLoader2 = new SocketIOLoader(server2, {
                main: packagePath,
                socket: {
                    connections: [`http://localhost:${port1}${socketApiNamespace}`]
                }

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
                socket: {
                    connections: [`http://localhost:${port1}${socketApiNamespace}`]
                }

            });

            socketLoader2.connect();

            socketLoader2.on('error', message => {
                expect(message).toContain(`failed to connect to: http://localhost:${port1}${socketApiNamespace}`);
                done();
            });
        });

        describe('and processing "stream" type sockets', () => {

            let tempDirectory,
                clientSocket,
                stream;

            beforeEach(() => {
                tempDirectory = temp.mkdirSync();
                stream = ss.createStream();
                socketLoader.connect();
                clientSocket = clientio.connect(`http://localhost:${port}${socketApiNamespace}`);
            });

            afterEach(() => {
                temp.cleanupSync();
                clientSocket.disconnect();
            });

            it('can send and receive a buffered stream if the socket type is "stream"', done => {
                let outputFilePath = path.join(tempDirectory, 'file.txt');

                stream.on('error', done.fail);
                ss(clientSocket).emit('download-file', stream, {fileName: 'hello-world.txt'});

                let writeStream = fs.createWriteStream(outputFilePath);

                writeStream.on('error', done.fail);
                writeStream.on('finish', () => {
                    expect(fs.readFileSync(outputFilePath)).toContain('Hello world!');
                    done();
                });

                stream.pipe(writeStream);
            });

            it('can send/receive binary data', done => {
                let outputFilePath = path.join(tempDirectory, 'cat.jpg');

                stream.on('error', done.fail);

                // Test ack callback usage too
                ss(clientSocket).emit('download-file', stream, {fileName: 'monorail-cat.jpg'}, message => {
                    expect(message).toContain('Started download');

                    let writeStream = fs.createWriteStream(outputFilePath);

                    writeStream.on('error', done.fail);
                    writeStream.on('finish', () => {
                        expect(fs.existsSync(outputFilePath)).toBeTruthy();

                        let buffer = readChunk.sync(outputFilePath, 0, 3);

                        expect(isJpg(buffer)).toBeTruthy();
                        done();
                    });

                    stream.pipe(writeStream);
                });
            });

            it('supports multiple streams', done => {
                let outputFilePath1 = path.join(tempDirectory, 'cat.jpg'),
                    outputFilePath2 = path.join(tempDirectory, 'more-cats.jpg'),
                    stream1 = ss.createStream(),
                    stream2 = ss.createStream(),
                    completedStreams = 0;

                stream1.on('error', done.fail);
                stream2.on('error', done.fail);

                ss(clientSocket).emit('download-multi-stream', stream1, {stream2, fileName: 'monorail-cat.jpg'}, message => {
                    expect(message).toContain('Started download');

                    let writeStream1 = fs.createWriteStream(outputFilePath1),
                        writeStream2 = fs.createWriteStream(outputFilePath2);

                    writeStream1.on('error', done.fail);
                    writeStream2.on('error', done.fail);

                    writeStream1.on('finish', () => {
                        expect(fs.existsSync(outputFilePath1)).toBeTruthy();
                        let buffer = readChunk.sync(outputFilePath1, 0, 3);
                        expect(isJpg(buffer)).toBeTruthy();

                        // Wait until both streams have finished writing before ending the test
                        if (++completedStreams > 1) {
                            done();
                        }
                    });
                    writeStream2.on('finish', () => {
                        expect(fs.existsSync(outputFilePath2)).toBeTruthy();
                        let buffer = readChunk.sync(outputFilePath2, 0, 3);
                        expect(isJpg(buffer)).toBeTruthy();

                        if (++completedStreams > 1) {
                            done();
                        }
                    });

                    stream1.pipe(writeStream1);
                    stream2.pipe(writeStream2);
                });
            });

            it('fails if an invalid stream is sent', done => {
                stream.on('error', done.fail);

                ss(clientSocket).emit('download-file', {}, message => {
                    expect(message.error).toContain('Invalid stream');
                    done();
                });
            });

        });

    });

});
