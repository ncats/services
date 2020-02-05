import {givenHttpServerConfig, Client, supertest} from '@loopback/testlab';
import {NoteApplication} from '../../application';
import {ExpressServer} from '../../server';

export async function setupExpressApplication() {
  const server = new ExpressServer({rest: givenHttpServerConfig()});
  await server.boot();
  await server.start();

  const lbApp = server.lbApp;

  const client = supertest('http://127.0.0.1:3000');

  return {server, client, lbApp};
}
