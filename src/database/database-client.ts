import { MikroORM } from '@mikro-orm/postgresql';
import ormConfig from '../config/mikro-orm.js';
import { Booking } from '../modules/booking/booking-entity.js';
import { Answer } from '../modules/qa/answer/answer-entity.js';
import { Question } from '../modules/qa/question/question-entity.js';
import { Specialty } from '../modules/specialty/specialty-entity.js';
import { Availability } from '../modules/user/trainer/availability/availability-entity.js';
import { Exception } from '../modules/user/trainer/exception/exception-entity.js';
import { Trainer } from '../modules/user/trainer/trainer-entity.js';
import { User } from '../modules/user/user-entity.js';
import { Item } from '../modules/wishlist/item/item-entity.js';
import { Wishlist } from '../modules/wishlist/wishlist-entity.js';

const orm = MikroORM.initSync(ormConfig);

export const db = {
  orm,
  em: orm.em,
  users: orm.em.getRepository(User),
  trainers: orm.em.getRepository(Trainer),
  wishlists: orm.em.getRepository(Wishlist),
  items: orm.em.getRepository(Item),
  specialties: orm.em.getRepository(Specialty),
  bookings: orm.em.getRepository(Booking),
  availabilities: orm.em.getRepository(Availability),
  exceptions: orm.em.getRepository(Exception),
  questions: orm.em.getRepository(Question),
  answers: orm.em.getRepository(Answer),
};
