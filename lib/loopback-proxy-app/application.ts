import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import * as path from 'path';
import {MySequence} from './sequence';
import {LegacyLoaderComponent} from './legacy-loader.component';
import {HealthComponent} from '@labshare/services-health';


export class LoopbackProxyApplication extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    this.component(HealthComponent);
    this.component(LegacyLoaderComponent);
  }
}
