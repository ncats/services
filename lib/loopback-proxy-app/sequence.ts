// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/context';
import {ApplicationConfig, CoreBindings} from '@loopback/core';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext, ResolvedRoute, ControllerRoute,
  RestBindings,
  Send,
  SequenceHandler
} from '@loopback/rest';
import {LabShareLogger, LogBindings} from '@labshare/services-logger';
import {AuthenticateFn, AuthenticationBindings} from '@labshare/services-auth';

const SequenceActions = RestBindings.SequenceActions;

export class LabShareSequence implements SequenceHandler {
  constructor(
    @inject(RestBindings.Http.CONTEXT) public ctx: Context,
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(LogBindings.LOGGER) protected logger: LabShareLogger,
    @inject(AuthenticationBindings.AUTH_ACTION) protected authenticateRequest: AuthenticateFn,
    @inject(AuthenticationBindings.USER_INFO_ACTION) protected setUserInfo: AuthenticateFn,
    @inject(CoreBindings.APPLICATION_CONFIG) protected config: ApplicationConfig
  ) {}

  async handle(context: RequestContext) {
    const {request, response} = context;
    try {
      const originalUrl = request.url;
      // lower case url so that LB4 router could find the controller route
      request.url = this.pathToLowerCase(request.url);
      const route = this.findRoute(request);
      // restore casing of route parameter values
      if (route instanceof ControllerRoute && originalUrl !== request.url) {
        this.restoreParamCasing(originalUrl, route);
      }
      request.url = originalUrl;
      request.params = route.pathParams;
      const args = await this.parseParams(request, route);
      if (!this.config?.services?.auth?.disable && !process.env.DISABLE_AUTH) {
        await this.authenticateRequest(request, response);
      }
      if (this.config?.services?.auth?.setUserInfo) {
        await this.setUserInfo(request, response);
      }
      const result = await this.invoke(route, args);
      this.logger.info(request.url, {
        url: request.url,
        method: request.method,
        params: request.params
      });
      this.send(response, result);
    } catch (error) {
      this.logger.error(request.url, error.stack, {
        url: request.url
      });
      this.reject(context, error);
    }
  }

  /**
   * Converts path of a URL to lowercase while leaving original casing for query string
   * @param url
   */
  private pathToLowerCase(url: string): string {
    const urlParts = url.split('?');
    urlParts[0] = urlParts[0].toLowerCase();
    return urlParts.join('?');
  }

  /**
   * Sets route parameter values to the values in the original URL from the incoming requesr
   * @param originalUrl - original (not lower-cased) URL from the incoming request
   * @param route object
   */
  private restoreParamCasing(originalUrl: string, route: ResolvedRoute) {
    const originalPath = originalUrl.split('?')[0];
    const pathParts = originalPath.split('/');
    const routePathParts = route.path.split('/');
    for (let i = 0; i < routePathParts.length; i++) {
      const paramMatch = routePathParts[i].match(/{(.*)}/);
      if (paramMatch) {
        route.pathParams[paramMatch[1]] = decodeURI(pathParts[i]);
      }
    }
  }
}
