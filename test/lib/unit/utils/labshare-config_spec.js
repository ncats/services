'use strict';

const assert = require("assert");
const sinon = require("sinon");
const LabShareConfig = require("../../../../lib/utils/labshare-config");


describe('LabShare Config', () => {

    afterEach(() => {
            sinon.restore();
            LabShareConfig.labShareConfig = null;
        });

    it('read a configuration from labsharerc file', async () => {
        const configuration = await LabShareConfig.loadLabShareConfig();
        expect(configuration).toBeDefined();
    });
    it('it load labShare configuration', async () => {
        // requires labsharerc file at root
        const validateSpy = sinon.spy(LabShareConfig, 'loadLabShareConfig');
        const configurationValue = LabShareConfig.getLabShareConfig();
        assert(validateSpy.calledOnce);
        expect(configurationValue).toEqual({ mode: 'services' , apis:[]});
      });
      it('it load labShare configuration only once', async () => {
        // requires labsharerc file at root
        const validateSpy = sinon.spy(LabShareConfig, 'loadLabShareConfig');
        LabShareConfig.getLabShareConfig();
        LabShareConfig.getLabShareConfig();
        assert(validateSpy.calledOnce);
      });

});
