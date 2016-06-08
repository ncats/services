'use strict';

const path = require('path'),
    proxyquire = require('proxyquire'),
    express = require('express'),
    {EventEmitter} = require('events');

require('promise-matchers');

describe('SocketIOLoader', function () {

    let SocketIOLoader,
        socketLoader,
        expressApp,
        packagePath,
        options,
        apiPackage1Prefix,
        apiPackage2Prefix,
        socketInstanceStub,
        socketClientStub;

    beforeEach(function () {
        packagePath = './test/fixtures/main-package';
        socketInstanceStub = new EventEmitter();
        socketInstanceStub.of = jasmine.createSpy('of').andCallFake(function () {
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

    it('throws an exception when invalid arguments and/or options are provided', function () {
        expect(function () {
            new SocketIOLoader({
                main: [123]
            });
        }).toThrow();
        expect(function () {
            new SocketIOLoader({
                directories: ['a/directory', 5]
            });
        }).toThrow();
    });

    it('does not throw if options are not provided', function () {
        expect(function () {
            new SocketIOLoader();
        }).not.toThrow();
    });

    describe('when assigning socket IO events', function () {

        beforeEach(function () {
            spyOn(socketInstanceStub, 'on').andCallThrough();
        });

        it('establishes socket connections for all packages', function (done) {
            socketInstanceStub.on('custom-package-event', function (data) {
                expect(data).toBe('Hello from socket-api-package1!');
                done();
            });
            
            socketLoader.connect(expressApp);

            // Fake the initial and subsequent 'socket.io' connection events
            socketInstanceStub.emit('connection', socketInstanceStub);
            socketInstanceStub.emit('connection', socketInstanceStub);

            expect(socketInstanceStub.of).toHaveBeenCalledWith(apiPackage1Prefix);
        });
        
        it('establishes client connections too', function (done) {
            options.connections = [
                'http://my.api.host'
            ];

            socketClientStub.on('finished-processing', function (data) {
                expect(data).toBe('finished processing data!');
                done(); 
            });
            
            socketLoader = new SocketIOLoader(options);
            socketLoader.connect(expressApp);

            socketClientStub.emit('process-something', 'Data');
        });

    });

});
