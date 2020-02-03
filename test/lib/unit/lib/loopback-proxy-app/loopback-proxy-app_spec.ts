import {expect} from '@loopback/testlab';
import * as supertest from 'supertest';

const express = require('express');
const {LoopbackProxyApplication} = require('../../../../../lib/loopback-proxy-app');

describe('Loopback Proxy App', () => {
  let expressApp,
    lb4ProxyApp,
    request: supertest.SuperTest<supertest.Test>;
  beforeAll(async () => {
    // const pkg = require('/Users/dmitry/GitRepos/services/test/fixtures/main-package');
    const config = {
      services: {
        main: `${process.cwd()}/test/fixtures/main-package`
      }
    };
    expressApp = express();
    lb4ProxyApp = new LoopbackProxyApplication(config);
    expressApp.use(lb4ProxyApp.requestHandler);
    await lb4ProxyApp.boot();
    await lb4ProxyApp.start();
    request = supertest(expressApp);
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
    await request.get('/api-package-1-namespace/123/_api/hello').expect('Hello World!');
    await request.post('/api-package-1-namespace/123/_api/settings').expect(200);
    await request.post('/api-package-1-namespace/open').expect(200);
    await request.options('/api-package-2/list/mylist/items').expect(204);
    await request.post('/api-package-2/list/mylist/items').expect(200);
    await request.get('/api-package-2/list/mylist/items/123').expect(200);
    await request.put('/api-package-2/list/mylist/items/123').expect(400);
    await request.delete('/api-package-2/list/mylist/items/123').expect(200);
  });

  it('does not load APIs from "packageDependencies" recursively', async () => {
    await request.get('/nested-api-package/nested/api').expect(404);
  });
});

