'use strict';

const path = require('path'),
    proxyquire = require('proxyquire'),
    express = require('express'),
    {EventEmitter} = require('events');

describe('SocketIOLoader', () => {

    let SocketIOLoader,
        socketLoader,
        expressApp,
        packagePath,
        options,
        apiPackage1Prefix,
        apiPackage2Prefix,
        socketInstanceStub,
        socketClientStub;

    beforeEach(() => {
        packagePath = './test/fixtures/main-package';
        socketInstanceStub = new EventEmitter();
        socketInstanceStub.of = jasmine.createSpy('of').and.callFake(function () {
            return this;
        });
        socketInstanceStub.sockets = {
            setMaxListeners() {
                return this;
            }
        };
        socketClientStub = new EventEmitter();

        socketInstanceStub.setMaxListeners(50);
        socketClientStub.setMaxListeners(50);

        options = {
            main: packagePath,
            directories: [path.join(packagePath, 'node_modules', 'socket-api-package1')]
        };
        apiPackage1Prefix = '/socket-api-package-1-namespace';
        apiPackage2Prefix = '/socket-api-package-1';

        expressApp = express();

        SocketIOLoader = proxyquire('../../../../lib/api/socket-io-loader', {
            'socket.io': function () {
                return socketInstanceStub;
            },
            'socket.io-client': {
                connect: function () {
                    return socketClientStub;
                }
            }
        });
        socketLoader = new SocketIOLoader(options);
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

        beforeEach(function () {
            spyOn(socketInstanceStub, 'on').and.callThrough();
        });

        it('establishes socket connections for all packages', () => {
            let customMessage = '';

            socketInstanceStub.on('custom-package-event', data => {
                customMessage = data;
            });
            
            socketLoader.connect(expressApp);

            // Fake the initial and subsequent 'socket.io' connection events
            socketInstanceStub.emit('connection', socketInstanceStub);
            socketInstanceStub.emit('connection', socketInstanceStub);

            expect(socketInstanceStub.of).toHaveBeenCalledWith(apiPackage1Prefix);
            expect(customMessage).toBe('Hello from socket-api-package1!');
        });
        
        it('establishes client connections too', done => {
            options.connections = [
                'http://my.api.host'
            ];

            socketClientStub.on('finished-processing', data => {
                expect(data).toBe('finished processing data!');
                done(); 
            });
            
            socketLoader = new SocketIOLoader(options);
            socketLoader.connect(expressApp);

            socketClientStub.emit('process-something', 'Data');
        });

    });

});
