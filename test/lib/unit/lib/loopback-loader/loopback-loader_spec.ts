import {expect} from '@loopback/testlab';
import * as path from 'path';
const {LoopbackLoader} = require('../../../../../lib/loopback-loader');
describe('Loopback Loader', () => {
 
    let config:any;
beforeEach(async () => {
         config = {
          services: {
            main: `${process.cwd()}/test/fixtures/loopback-app`
          },
          test3:{
              basePath:"/test3"
          }
        };
});

  it('should create a loopback loader instance ', async () => {
    const lbLoader = new LoopbackLoader(config);
    expect(lbLoader).to.not.be.undefined();
  });

  it('should load all the apis ', async () => {
    const lbLoader = new LoopbackLoader(config);
    expect(lbLoader).to.not.be.undefined();
    const apis =lbLoader.loadApis();
    expect(apis.length).to.greaterThanOrEqual(2);
  });
  it('should load all the apis and test get all api ', async () => {
    const lbLoader = new LoopbackLoader(config);
    expect(lbLoader).to.not.be.undefined();
    const apis =lbLoader.loadApis();
    expect(apis.length).to.greaterThanOrEqual(2);
    expect(apis.length).to.equal(lbLoader.getApis().length);
  });

  it('should set the api format setApiFormat ', async () => {
    const lbLoader = new LoopbackLoader(config);
    const result1 = lbLoader.setApiFormat( {name:"test" , basePath:"/basepath"},  require(path.join(config.services.main, './'))  );
    const result2 = lbLoader.setApiFormat( {name:"test"},  require(path.join(config.services.main, './'))  );
    const result3 = lbLoader.setApiFormat( {name:"test" , configAlias:"test3"},  require(path.join(config.services.main, './'))  );
    expect(result1).to.not.be.undefined();
    expect(result1.name).to.be.equal("test");
    expect(result1.basePath).to.be.equal("/basepath");
    expect(result1.app).to.not.be.undefined();

    expect(result2).to.not.be.undefined();
    expect(result2.name).to.be.equal("test");
    expect(result2.basePath).to.be.equal("/test");
    expect(result2.app).to.not.be.undefined();

    expect(result3).to.not.be.undefined();
    expect(result3.name).to.be.equal("test");
    expect(result3.basePath).to.be.equal("/test3");
    expect(result3.app).to.not.be.undefined();
  });


 
});

