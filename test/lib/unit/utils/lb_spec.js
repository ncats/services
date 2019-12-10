'use strict';

const assert = require("assert");
const sinon = require("sinon");
const path = require("path");
const LbHelper = require("../../../../lib/utils/lb");
const LabShareConfig = require("../../../../lib/utils/labshare-config");
const testModulePath = path.join(__dirname ,"../../../fixtures/package")


describe('lb Utils', () => {

    afterEach(() => {
            sinon.restore();
          
        });

    it('lb getApiRestSettings with defined config', async () => {
     let lbHelper = new LbHelper();
     let settings = lbHelper.getApiRestSettings({ "test":{test:1}} , "test");
     expect(settings).toBeDefined()
    });

    it('lb getApiRestSettings with no config', async (done) => {
      let lbHelper = new LbHelper();
      try{
        lbHelper.getApiRestSettings({ "test":{test:1}} , "testApi");
      }catch(err){
        expect(err).toBeDefined()
        done();
      }
    
     });

     it('lb loadAPIs', async () => {
      const labshareRCMock={
        apis:[ {name:"local"} ,{name:"remote" , package:"remote"}]
      }
      
      const configMock ={
        "local":{},
        "remote":{}
      }
      let lbHelper = new LbHelper(labshareRCMock,configMock);
      const apis = lbHelper.loadAPIs(testModulePath);
      expect(apis).toBeDefined();
      expect(apis.length).toBe(2);
    
     });

     it('lb loadAPIs with config alias', async () => {
      const labshareRCMock={
        apis:[ {name:"main" ,package:"remote" ,  configAlias:"remote"}]
      }
      
      const configMock ={
        "local":{},
        "remote":{}
      }
      let lbHelper = new LbHelper(labshareRCMock,configMock);
      const apis = lbHelper.loadAPIs(testModulePath);
      expect(apis).toBeDefined();
      expect(apis.length).toBe(1);
    
     });

     it('lb loadAPIs with config alias', async () => {
      let labShareConfigSpy = sinon.spy(LbHelper.prototype , 'getApiRestSettings');
      const labshareRCMock={
        apis:[ {name:"main" ,package:"remote" ,  configAlias:"remote"}]
      }
      
      const configMock ={
        "local":{},
        "remote":{}
      }
      let lbHelper = new LbHelper(labshareRCMock,configMock);
      const apis = lbHelper.loadAPIs(testModulePath);
      expect(apis).toBeDefined();
      expect(apis.length).toBe(1);
      assert(labShareConfigSpy.calledOnce);
     });
 

});
