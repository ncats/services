'use strict';

const supertest = require('supertest'),
    http = require('http'),
    clientio = require('socket.io-client'),
    portfinder = require('portfinder'),
    _ = require('lodash');

describe('Services', () => {

    let packagesPath,
        Services,
        services,
        port,
        loggerMock,
        server,
        apiPackage1Prefix,
        options;

    beforeEach(done => {
        packagesPath = './test/fixtures/main-package';
        apiPackage1Prefix = '/socket-api-package-1-namespace';
        loggerMock = jasmine.createSpyObj('logger', ['error', 'info', 'warn']);

        portfinder.getPort((error, unusedPort) => {
            if (error) {
                done.fail(error);
                return;
            }

            port = unusedPort;

            global.LabShare = {
                Config: {
                    services: {
                        Listen: {
                            Port: unusedPort
                        }
                    }
                }
            };

            options = {
                logger: loggerMock,
                main: packagesPath,
                morgan: {
                    enable: false
                },
                connections: []
            };

            Services = require('../../../../lib/services');
            services = new Services(options);

            done();
        });
    });

    afterEach(() => {
        delete global.LabShare;
    });

    it('sets default configuration', done => {
        services.config(({services, app}) => {
            expect(_.values(services).length).toBeGreaterThan(0);
            expect(app).toBeDefined();
        });

        expect(_.get(global, 'LabShare.IO')).toBeUndefined();

        server = services.start();

        let request = supertest(server),
            clientSocket = clientio.connect(`http://localhost:${port}${apiPackage1Prefix}`);

        expect(global.LabShare.IO).toBeDefined();

        request.get('/api-package-1-namespace/123/_api/hello')
            .expect('Hello World!')
            .then(data => {
                // Check default security headers
                expect(data.headers['x-powered-by']).toBeUndefined();
                expect(data.headers['access-control-allow-origin']).toBe('*');
                expect(data.headers['x-dns-prefetch-control']).toBe('off');
                expect(data.headers['referrer-policy']).toBe('no-referrer');
                expect(data.headers['x-xss-protection']).toBe('1; mode=block');

                // Test socket connections
                clientSocket.once('connect', (data) => {
                    clientSocket.emit('process-something', 'Data', (error, data) => {
                        expect(data).toBe('data');

                        clientSocket.disconnect();
                        done();
                    });
                });
            })
            .catch(done.fail);
    });

    it('throws if configuration is applied after the server is started', () => {
        let services = new Services(options);

        server = services.start();

        expect(() => {
            services.config();
        }).toThrowError(/cannot modify the LabShare API services after starting up the server/i);
    });

});
