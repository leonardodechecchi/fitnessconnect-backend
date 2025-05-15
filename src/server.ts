import { bootstrapApplication } from './app.js';
import { logger } from './lib/logger.js';

bootstrapApplication().catch((error) => {
  logger.error(error);
  process.exit(1);
});
