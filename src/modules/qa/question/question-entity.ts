import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
  type Opt,
  type Ref,
} from '@mikro-orm/core';
import type { User } from '../../user/user-entity.js';

export enum QuestionStatus {
  OPEN = 'OPEN',
  ANSWERED = 'ANSWERED',
  ARCHIVED = 'ARCHIVED',
}

@Entity()
export class Question {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'text' })
  content!: string;

  @Enum({ items: () => QuestionStatus })
  status: QuestionStatus & Opt = QuestionStatus.OPEN;

  @Property()
  isAnonymous: boolean & Opt = true;

  @ManyToOne()
  user!: Ref<User>;
}
