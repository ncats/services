// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/context';
import {FindRoute, InvokeMethod, ParseParams, Reject, RequestContext, RestBindings, Send, SequenceHandler} from '@loopback/rest';
import {LabShareLogger, LogBindings} from '@labshare/services-logger';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(RestBindings.Http.CONTEXT) public ctx: Context,
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(LogBindings.LOGGER) protected logger: LabShareLogger
  ) {}

  async handle(context: RequestContext) {
    const {request, response} = context;
    try {
      const route = this.findRoute(request);
      request.params = route.pathParams;
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      this.logger.error(request.url, error.stack, {
        url: request.url
      });
      this.reject(context, error);
    }
  }
}
