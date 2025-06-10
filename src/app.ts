import type { ForbiddenError } from '@casl/ability';
import { RequestContext } from '@mikro-orm/core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { Settings } from 'luxon';
import morgan from 'morgan';
import path from 'path';
import swaggerUI from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import { env } from './config/env.js';
import { db } from './database/database-client.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { authRouter } from './modules/auth/auth-router.js';
import { specialtyRouter } from './modules/specialty/specialty-router.js';
import { trainerRouter } from './modules/user/trainer/trainer-router.js';
import { userRouter } from './modules/user/user-router.js';
import {
  convertOpenAPIDocToYAML,
  generateOpenAPIDocumentation,
  writeOpenAPIDocToDisk,
} from './openapi/openapi-service.js';
import type { Ability } from './types/casl.js';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      ability: Ability;
      forbidden: ForbiddenError<Ability>;
    }
  }
}

Settings.throwOnInvalid = true;

declare module 'luxon' {
  interface TSSettings {
    throwOnInvalid: true;
  }
}

export const bootstrapApplication = async () => {
  const app = express();

  await db.orm.connect();

  app.use(
    cors({
      origin: env.CLIENT_SIDE_URL,
      credentials: true,
    })
  );

  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use((_, __, next) => RequestContext.create(db.em, next));

  app.use(authRouter.rootPath, authRouter.router);
  app.use(userRouter.rootPath, userRouter.router);
  app.use(trainerRouter.rootPath, trainerRouter.router);
  app.use(specialtyRouter.rootPath, specialtyRouter.router);

  const openAPIDoc = generateOpenAPIDocumentation();
  const openAPIDocYAML = convertOpenAPIDocToYAML(openAPIDoc);
  writeOpenAPIDocToDisk(openAPIDocYAML);

  app.get('/docs/openapi-docs.yaml', (_, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const pathToFile = path.join(__dirname, 'openapi', 'openapi-docs.yaml');

    res.sendFile(pathToFile);
  });

  app.use(
    '/docs',
    swaggerUI.serve,
    swaggerUI.setup(yaml.parse(openAPIDocYAML))
  );

  app.use(errorHandler);

  const httpServer = app.listen(env.HTTP_PORT, () => {
    logger.info(`Server listening on http://localhost:${env.HTTP_PORT}`);
    logger.info(`API Docs on http://localhost:${env.HTTP_PORT}/docs`);
  });

  const shutdown = async (cb?: () => void) => {
    try {
      await db.orm.close();
      httpServer.close(cb);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown(() => process.exit(0)));
  process.on('SIGTERM', () => shutdown(() => process.exit(0)));
  process.on('SIGUSR2', () =>
    shutdown(() => process.kill(process.pid, 'SIGTERM'))
  );

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    shutdown(() => process.exit(1));
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', reason);
    shutdown(() => process.exit(1));
  });
};
