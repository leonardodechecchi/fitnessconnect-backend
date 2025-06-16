import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
  type Ref,
} from '@mikro-orm/core';
import type { Trainer } from '../../user/trainer/trainer-entity.js';
import type { Question } from '../question/question-entity.js';

@Entity()
@Unique({ properties: ['question', 'trainer'] }) // Un trainer può rispondere solo una volta a una domanda
export class Answer {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'text' })
  content!: string;

  @ManyToOne()
  question!: Ref<Question>;

  @ManyToOne()
  trainer!: Ref<Trainer>;
}
