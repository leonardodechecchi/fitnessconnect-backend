import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import type { Trainer } from '../trainer-entity.js';
import type { ExceptionShape } from './exception-schemas.js';

@Entity()
export class Exception implements ExceptionShape {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'timestamp' })
  startDatetime!: Date;

  @Property({ type: 'timestamp' })
  endDatetime!: Date;

  @Property()
  isAvailable!: boolean;

  @Property({ type: 'text' })
  reason?: string;

  @ManyToOne()
  trainer!: Ref<Trainer>;
}
