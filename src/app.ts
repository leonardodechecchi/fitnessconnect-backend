import type { ForbiddenError } from '@casl/ability';
import { RequestContext } from '@mikro-orm/core';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { Settings } from 'luxon';
import morgan from 'morgan';
import { env } from './config/env.js';
import { db } from './database/database-client.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { authRouter } from './modules/auth/auth-controller.js';
import { qaRouter } from './modules/qa/qa-router.js';
import { specialtyRouter } from './modules/specialty/specialty-router.js';
import { trainerRouter } from './modules/user/trainer/trainer-router.js';
import { userRouter } from './modules/user/user-controller.js';
import { wishlistRouter } from './modules/wishlist/wishlist-controller.js';
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

  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use((_, __, next) => RequestContext.create(db.em, next));

  app.use('/auth', authRouter);
  app.use('/users', userRouter);
  app.use('/trainers', trainerRouter);
  app.use('/wishlists', wishlistRouter);
  app.use('/specialties', specialtyRouter);
  app.use('/qa', qaRouter);

  app.use(errorHandler);

  const httpServer = app.listen(env.HTTP_PORT, () =>
    logger.info(`Server listening on http://localhost:${env.HTTP_PORT}`)
  );

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
