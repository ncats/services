'use strict'

const Services = require('../lib/services')
const _ = require('lodash')
const servicesCache = require('@labshare/services-cache').Middleware

exports.usage = [
  'lsc services start      - Start up LabShare API services.',
  ''
]

exports.start = async function () {
  this.log.info('Starting LabShare services...')

  const config = _.get(global, 'LabShare.Config')
  const services = new Services(config)

  services.config(({app}) => {
    // Enable response compression and CORS
    app.use(require('compression')())
    app.use(require('cors')())
  })

  if (_.get(config, 'shell.Cache.enable')) {
    services.config(servicesCache(_.get(config, 'shell.Cache'), this.log))
  }
  await services.start()
}
