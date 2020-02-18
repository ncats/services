import {expect} from '@loopback/testlab';
import * as supertest from 'supertest';

const express = require('express');
const {LoopbackProxyApplication} = require('../../../../../lib/loopback-proxy-app');

describe('Loopback Proxy App', () => {
  let expressApp: { use: (arg0: any) => void; },
    lb4ProxyApp: { requestHandler: any; boot: () => any; start: () => any; stop: () => any; close: () => any;},
    request: supertest.SuperTest<supertest.Test>;
  beforeEach(async () => {
    const config = {
      services: {
        main: `${process.cwd()}/test/fixtures/main-package`,
      }
    };
    expressApp = express();
    lb4ProxyApp = new LoopbackProxyApplication(config);
    expressApp.use(lb4ProxyApp.requestHandler);
    await lb4ProxyApp.boot();
    await lb4ProxyApp.start();
    request = supertest(expressApp);
  });

  afterEach(async () => {
    await lb4ProxyApp.stop();
    await lb4ProxyApp.close();
  });

  it('should expose /versions route', async () => {
    const response = await request.get('/versions').expect(200);
    expect(response.body).not.to.be.undefined();
    expect(response.body.versions).to.containDeep([
      {
        api: 'api-package-1-namespace',
        apiDetails: {
          name: 'api-package-1',
          version: '0.0.1',
          description: 'Api package name space'
        }
      },
      {
        api: 'api-package-2',
        apiDetails: {
          name: 'api-package-2',
          version: '0.0.1'
        }
      }
    ]);
  });

  it('exposes all the valid package routes defined by package API modules', async () => {
    await request.get('/test-facility/api-package-1-namespace/123/_api/hello').expect('Hello World!');
    await request.post('/test-facility/api-package-1-namespace/123/_api/settings').expect(200);
    await request.post('/test-facility/api-package-1-namespace/open').expect(200);
    await request.options('/test-facility/api-package-2/list/mylist/items').expect(204);
    await request.post('/test-facility/api-package-2/list/mylist/items').expect(200);
    await request.get('/test-facility/api-package-2/list/mylist/items/123').expect(200);
    await request.put('/test-facility/api-package-2/list/mylist/items/123').expect(400);
    await request.delete('/test-facility/api-package-2/list/mylist/items/1k423').expect(200);
  });

  it('should provide case insensitive routing', async () => {
    await request.get('/test-facility/api-package-1-namespace/123/_api/HellO').expect('Hello World!');
  });

  it('does not load APIs from "packageDependencies" recursively', async () => {
    await request.get('/test-facility/nested-api-package/nested/api').expect(404);
  });

  it('mounts API at specified mountPath', async () => {
    const config = {
      services: {
        main: `${process.cwd()}/test/fixtures/main-package`,
        mountPath: '/someBasePath'
      }
    };
    const lb4App = new LoopbackProxyApplication(config);
    // @ts-ignore
    expressApp._router = undefined;  // clear all previously defined routes
    expressApp.use(lb4App.requestHandler);
    await lb4App.boot();
    await request.get('/someBasePath/api-package-1-namespace/123/_api/hello').expect('Hello World!');
  });

  it('mounts API at root if mountPath is set to "/"', async () => {
    const config = {
      services: {
        main: `${process.cwd()}/test/fixtures/main-package`,
        mountPath: '/'
      }
    };
    const lb4App = new LoopbackProxyApplication(config);
    // @ts-ignore
    expressApp._router = undefined;  // clear all previously defined routes
    expressApp.use(lb4App.requestHandler);
    await lb4App.boot();
    await request.get('/api-package-1-namespace/123/_api/hello').expect('Hello World!');
  });
});

