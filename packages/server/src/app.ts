import 'isomorphic-fetch';
import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import cors from 'kcors';
import graphqlHttp from 'koa-graphql';
import bodyParser from 'koa-bodyparser';
import { GraphQLError } from 'graphql';
import koaPlayground from 'graphql-playground-middleware-koa';

import { schema } from './schema/schema';
import { getDataloaders } from './modules/loader/loaderRegister';
import { getUser } from './auth';

const router = new Router();

const app = new Koa();

app.use(bodyParser());

app.on('error', err => {
  // eslint-disable-next-line
  console.log('app error: ', err);
});

app.use(logger());
app.use(cors());

router.get('/', async ctx => {
  ctx.body = 'Welcome to React Europe Relay Workshop';
});

const graphqlSettingsPerReq = async (req: Request) => {
  const { user } = await getUser(req.header.authorization);

  const dataloaders = getDataloaders();

  return {
    graphiql: process.env.NODE_ENV !== 'production',
    schema,
    context: {
      user,
      req,
      dataloaders,
    },
    formatError: (error: GraphQLError) => {
      // eslint-disable-next-line
      console.log(error.message);
      // eslint-disable-next-line
      console.log(error.locations);
      // eslint-disable-next-line
      console.log(error.stack);

      return {
        message: error.message,
        locations: error.locations,
        stack: error.stack,
      };
    },
  };
};

const graphqlServer = graphqlHttp(graphqlSettingsPerReq);

router.all('/graphql', graphqlServer);
router.all(
  '/graphiql',
  koaPlayground({
    endpoint: '/graphql',
    subscriptionEndpoint: '/subscriptions',
    // subscriptionsEndpoint: `ws://localhost:${port}/subscriptions`
  }),
);

app.use(router.routes()).use(router.allowedMethods());

export default app;
