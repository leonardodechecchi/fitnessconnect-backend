import {
  Collection,
  Entity,
  HiddenProps,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryKeyProp,
  Property,
  type Ref,
} from '@mikro-orm/core';
import type { Specialty } from '../../specialty/specialty-entity.js';
import type { User } from '../user-entity.js';
import { Availability } from './availability/availability-entity.js';
import { Exception } from './exception/exception-entity.js';

@Entity()
export class Trainer {
  static readonly modelName = 'Trainer';

  [HiddenProps]?: 'sessionDuration';

  @OneToOne({ primary: true })
  user!: Ref<User>; // reuse the primary key from User entity

  [PrimaryKeyProp]?: 'user';

  @Property({ type: 'text' })
  bio?: string;

  @Property({ hidden: true })
  sessionDuration!: number; // ? default session duration in minutes

  @ManyToMany()
  specialties = new Collection<Specialty>(this);

  @OneToMany(() => Availability, (availability) => availability.trainer)
  availabilities = new Collection<Availability>(this);

  @OneToMany(() => Exception, (exception) => exception.trainer)
  exceptions = new Collection<Exception>(this);
}
