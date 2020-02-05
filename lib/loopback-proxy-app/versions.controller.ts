import {get} from '@loopback/rest';
import {Constructor} from '@loopback/core';
import {ApiVersionsResponse} from './types'
import * as _ from 'lodash';

export function createVersionsController(packageManifests: any[]): Constructor<unknown> {
  class VersionsController {
    @get('/versions', {
      responses: {
        '200': {
          description: 'Build and package dependencies versions',
          content: {
            'application/json': {schema: {'x-ts-type': ApiVersionsResponse}}
          }
        }
      }
    })
    versions(): ApiVersionsResponse {
      const buildVersion = _.get(packageManifests, '[0].version');
      const versions = _.map(packageManifests, (manifest) => {
        return {
          api: _.get(manifest, 'namespace') || _.get(manifest, 'name'),
          apiDetails: {
            name: _.get(manifest, 'name'),
            version: _.get(manifest, 'version'),
            description: _.get(manifest, 'description')
          }
        }
      });
      return {buildVersion, versions};
    }
  }

  return VersionsController;
}

