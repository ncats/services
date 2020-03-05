const proxyquire = require('proxyquire');
const sinon = require('sinon');
const _ = require('lodash');

describe('start', () => {
  let servicesCli;
  let servicesMock;
  let servicesStartStub;
  let servicesConfigStub;
  let servicesConstructorStub;
  let servicesCacheMock;

  beforeEach(() => {
    servicesMock = servicesConstructorStub = sinon.stub().returns({
      start: servicesStartStub = sinon.stub().resolves({}),
      config: servicesConfigStub = sinon.stub()
    });
    servicesCacheMock = sinon.stub().returns({cache: 'middleware'});
    servicesCli = proxyquire('../../../../cli/services', {
      '../lib/services': servicesMock,
      '@labshare/services-cache': {Middleware: servicesCacheMock}
    });
  });

  it('should Services constructor with expected config', async () => {
    _.set(global, 'LabShare.Config', {test: 'value'});
    await servicesCli.start();
    expect(servicesConstructorStub.args).toEqual([[{test: 'value'}]]);
  });

  it('should call services start() once', async () => {
    await servicesCli.start();
    expect(servicesStartStub.callCount).toEqual(1);
  });

  it('should call services config() once if cache is not enabled', async () => {
    await servicesCli.start();
    expect(servicesConfigStub.callCount).toEqual(1);
  });

  it('should call services config() with expected value if cache is enabled', async () => {
    _.set(global, 'LabShare.Config.shell.Cache.enable', true);
    await servicesCli.start();
    expect(servicesConfigStub.callCount).toEqual(2);
    expect(servicesConfigStub.secondCall.args[0]).toEqual({cache: 'middleware'});
  });
});
