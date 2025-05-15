import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import type { Trainer } from '../user/trainer/trainer-entity.js';
import type { User } from '../user/user-entity.js';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED_BY_USER = 'cancelled_by_user',
  CANCELLED_BY_TRAINER = 'cancelled_by_trainer',
  NO_SHOW = 'no_show',
}

@Entity()
export class Booking {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne({ unique: true })
  trainer!: Ref<Trainer>;

  @ManyToOne()
  user!: Ref<User>;

  @Property({ unique: true })
  startDatetime!: Date;

  @Property()
  endDatetime!: Date;

  @Enum({ items: () => BookingStatus })
  status = BookingStatus.PENDING;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
