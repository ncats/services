const lib = require('../utils');
const Services = require('../services');
const servicesAuth = require('@labshare/services-auth');
const servicesCache = require('@labshare/services-cache').Middleware;
const _ = require('lodash');
class ServicesBuilder{

    constructor(labShareRC,config , lbConfig ){

        this.labShareRC = labShareRC;
        this.config = config;
        this.lbConfig = lbConfig;
    }

 async build()  {
    const lbServices = new lib.Lb(this.labShareRC , this.lbConfig);
    const lbApis = lbServices.loadAPIs( this.labShareRC);
    const options = this.config.get('services') || {};
    const lsServices = new Services(options);
    const tenant = _.get(options, 'auth.tenant') || _.get(options, 'auth.organization') || 'ls';
    const authUrl =
      _.get(this.config.get('shell') || {}, 'Auth.Url') || _.get(options, 'auth.url') || 'https://a.labshare.org/_api';
    const audience = _.get(options, 'auth.audience') || 'ls-api';
  
    lsServices.config(async ({app}) => {
      app.use(require('compression')());
      app.use(require('cors')());

      for(const api of lbApis )
      {
        app.use('/', api.app.requestHandler);
        await  api.app.boot();
      }
    
    });
  
    lsServices.config(
      servicesAuth({
        authUrl,
        tenant,
        audience
      })
    );
    const cacheConfig = this.config.get('shell') || {};
    if (_.get(cacheConfig, 'Cache.enable')) {
      lsServices.config(servicesCache(_.get(cacheConfig, 'Cache'), this.log));
    }
    for(const api of lbApis )
      {
        await api.app.start();
      }
    lsServices.start();
  }
}
module.exports = ServicesBuilder;


