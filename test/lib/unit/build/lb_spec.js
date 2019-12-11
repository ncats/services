'use strict';

const assert = require("assert");
const sinon = require("sinon");
const path = require("path");
const LbBuilder = require("../../../../lib/build/lb");
const express = require('express');


describe('lb Builder', () => {
    afterEach(() => {
            sinon.restore();
          
        });
    it('lb builder will get the default configuration for helmet', async () => { 
        const labshareRCMock={
            apis:[ {name:"main" ,package:"remote" ,  configAlias:"remote"}]
          }
          
          const configMock ={
            "local":{},
            "remote":{}
          }
            let lbHelper = new LbBuilder(labshareRCMock , configMock);
            const newConfig = lbHelper.getDefaultConfig(configMock);
            expect(newConfig.rest.security).toBeDefined();
    });

    it('lb builder building process', async () => { 
        const labshareRCMock={
            apis:[ {name:"main" ,package:"test/fixtures/package/remote" ,  configAlias:"remote"}]
          }
          
          const configMock ={
            "rest":{
                port:8080,
                host:'0.0.0.0'
            },
            "local":{},
            "remote":{}
          }
            let lbHelper = new LbBuilder(labshareRCMock , configMock);
            await lbHelper.build();
            expect(lbHelper.server).toBeDefined();
    });
});
