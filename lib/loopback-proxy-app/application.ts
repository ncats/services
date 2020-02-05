import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import * as path from 'path';
import {LabShareSequence} from './sequence';
import {LegacyLoaderComponent} from './legacy-loader.component';
import {HealthComponent} from '@labshare/services-health';
import {ServicesLoggerComponent} from '@labshare/services-logger';

export class LoopbackProxyApplication extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(LabShareSequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    this.component(ServicesLoggerComponent);
    this.component(HealthComponent);
    this.component(LegacyLoaderComponent);
  }
}
