import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {join} from 'path';
import {LabShareSequence} from './sequence';
import {LegacyLoaderComponent} from './legacy-loader.component';
import {HealthComponent} from '@labshare/services-health';
import {ServicesLoggerComponent} from '@labshare/services-logger';
import {LbServicesAuthComponent, AuthenticationBindings} from '@labshare/services-auth';

export class LoopbackProxyApplication extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(LabShareSequence);

    this.bind(AuthenticationBindings.AUTH_CONFIG).to({
      authUrl: options?.services?.auth?.url || options?.auth?.url || 'https://a.labshare.org/_api',
      tenant: options?.services?.auth?.tenant || options?.services?.auth?.organization || 'ls',
      audience: options?.services?.auth?.audience
    });

    // Set up default home page
    this.static('/', join(__dirname, '../public'));

    this.component(RestExplorerComponent);
    this.projectRoot = __dirname;
    this.component(ServicesLoggerComponent);
    this.component(HealthComponent);
    this.component(LegacyLoaderComponent);
    this.component(LbServicesAuthComponent);
  }
}
