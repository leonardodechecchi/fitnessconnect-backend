import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import type { Trainer } from '../trainer-entity.js';

@Entity()
export class Availability {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  dayOfWeek!: number;

  @Property({ type: 'time' })
  startTime!: string;

  @Property({ type: 'time' })
  endTime!: string;

  @ManyToOne()
  trainer!: Ref<Trainer>;
}
