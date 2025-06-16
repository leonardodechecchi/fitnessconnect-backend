import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { ApiError } from '../lib/api-error.js';
import { Booking } from '../modules/booking/booking-entity.js';
import { Answer } from '../modules/qa/answer/answer-entity.js';
import { Question } from '../modules/qa/question/question-entity.js';
import { Specialty } from '../modules/specialty/specialty-entity.js';
import { Admin } from '../modules/user/admin/admin-entity.js';
import { Availability } from '../modules/user/trainer/availability/availability-entity.js';
import { Exception } from '../modules/user/trainer/exception/exception-entity.js';
import { Trainer } from '../modules/user/trainer/trainer-entity.js';
import { User } from '../modules/user/user-entity.js';
import { Item } from '../modules/wishlist/item/item-entity.js';
import { Wishlist } from '../modules/wishlist/wishlist-entity.js';
import { env } from './env.js';

export default defineConfig({
  dbName: env.POSTGRES_DB,
  debug: env.NODE_ENV === 'development',
  entities: [
    User,
    Trainer,
    Admin,
    Wishlist,
    Item,
    Specialty,
    Booking,
    Availability,
    Exception,
    Question,
    Answer,
  ],
  extensions: [SeedManager],
  findOneOrFailHandler: (entityName, where) =>
    ApiError.notFound(`${entityName} not found`),
  forceUtcTimezone: true,
  metadataProvider: TsMorphMetadataProvider,
  password: env.POSTGRES_PASSWORD,
  seeder: {
    path: 'dist/database/seeders',
    pathTs: 'src/database/seeders',
  },
});
