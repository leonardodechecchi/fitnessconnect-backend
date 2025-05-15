import type { InferSubjects, MongoAbility, RawRuleOf } from '@casl/ability';
import type { Booking } from '../modules/booking/booking-entity.js';
import type { Answer } from '../modules/qa/answer/answer-entity.js';
import type { Question } from '../modules/qa/question/question-entity.js';
import type { Specialty } from '../modules/specialty/specialty-entity.js';
import type { Availability } from '../modules/user/trainer/availability/availability-entity.js';
import type { Exception } from '../modules/user/trainer/exception/exception-entity.js';
import type { Trainer } from '../modules/user/trainer/trainer-entity.js';
import type { User } from '../modules/user/user-entity.js';
import type { Item } from '../modules/wishlist/item/item-entity.js';
import type { Wishlist } from '../modules/wishlist/wishlist-entity.js';

type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subject = InferSubjects<
  | typeof User
  | typeof Trainer
  | typeof Wishlist
  | typeof Item
  | typeof Specialty
  | typeof Booking
  | typeof Availability
  | typeof Exception
  | typeof Question
  | typeof Answer
  | 'all'
>;

export type Ability = MongoAbility<[Action, Subject]>;

export type AbilityRule = RawRuleOf<Ability>;
